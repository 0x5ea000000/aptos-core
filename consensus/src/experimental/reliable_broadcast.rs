// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

use crate::{network::NetworkSender, network_interface::ConsensusMsg};
use anyhow::bail;
use aptos_consensus_types::{
    common::Author,
    experimental::{commit_decision::CommitDecision, commit_vote::CommitVote},
};
use aptos_reliable_broadcast::{BroadcastStatus, RBMessage, RBNetworkSender};
use aptos_types::validator_verifier::ValidatorVerifier;
use async_trait::async_trait;
use futures::future::AbortHandle;
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, time::Duration};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum CommitMessage {
    Vote(CommitVote),
    Decision(CommitDecision),
    Ack(()),
}

impl CommitMessage {
    pub fn verify(&self, verifier: &ValidatorVerifier) -> anyhow::Result<()> {
        match self {
            CommitMessage::Vote(vote) => vote.verify(verifier),
            CommitMessage::Decision(decision) => decision.verify(verifier),
            CommitMessage::Ack(_) => Ok(()),
        }
    }
}

impl RBMessage for CommitMessage {}

pub struct AckState {
    validators: HashSet<Author>,
}

impl AckState {
    pub fn new(validators: impl Iterator<Item = Author>) -> Self {
        Self {
            validators: validators.collect(),
        }
    }
}

impl BroadcastStatus<CommitMessage> for AckState {
    type Ack = CommitMessage;
    type Aggregated = ();
    type Message = CommitMessage;

    fn add(&mut self, peer: Author, _ack: Self::Ack) -> anyhow::Result<Option<Self::Aggregated>> {
        if self.validators.remove(&peer) {
            if self.validators.is_empty() {
                Ok(Some(()))
            } else {
                Ok(None)
            }
        } else {
            bail!("Unknown author: {}", peer);
        }
    }
}

#[async_trait]
impl RBNetworkSender<CommitMessage> for NetworkSender {
    async fn send_rb_rpc(
        &self,
        receiver: Author,
        message: CommitMessage,
        timeout_duration: Duration,
    ) -> anyhow::Result<CommitMessage> {
        let msg = ConsensusMsg::CommitMessage(Box::new(message));
        let response = match self.send_rpc(receiver, msg, timeout_duration).await? {
            ConsensusMsg::CommitMessage(resp) if matches!(*resp, CommitMessage::Ack(_)) => *resp,
            _ => bail!("Invalid response to request"),
        };

        Ok(response)
    }
}

pub struct DropGuard {
    abort_handle: AbortHandle,
}

impl DropGuard {
    pub fn new(abort_handle: AbortHandle) -> Self {
        Self { abort_handle }
    }
}

impl Drop for DropGuard {
    fn drop(&mut self) {
        self.abort_handle.abort();
    }
}
