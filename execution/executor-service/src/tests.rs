// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

use aptos_vm::sharded_block_executor::{ShardedBlockExecutor};
use crate::remote_executor_shard::RemoteExecutorShard;
use crate::test_utils;

#[test]
fn test_sharded_block_executor_no_conflict() {
    let num_shards = 8;
    let (mut controller, executor_shards, _executor_services) = RemoteExecutorShard::create_thread_remote_executor_shards(num_shards, Some(2));
    controller.start();
    let sharded_block_executor = ShardedBlockExecutor::new(executor_shards);
    test_utils::test_sharded_block_executor_no_conflict(sharded_block_executor);
}

#[test]
fn test_sharded_executor_with_conflict() {
    let num_shards = 2;
    let (mut controller, executor_shards, _executor_services) = RemoteExecutorShard::create_thread_remote_executor_shards(num_shards, Some(2));
    controller.start();
    let sharded_block_executor = ShardedBlockExecutor::new(executor_shards);
    test_utils::test_sharded_block_executor_with_conflict(sharded_block_executor, 4);
}
