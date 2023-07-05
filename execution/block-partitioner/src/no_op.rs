// Copyright © Aptos Foundation

use crate::BlockPartitioner;
use aptos_types::{
    block_executor::partitioner::{
        CrossShardDependencies, SubBlock, SubBlocksForShard, TransactionWithDependencies,
    },
    transaction::Transaction,
};

pub struct NoOpPartitioner {}

impl BlockPartitioner for NoOpPartitioner {
    fn partition(
        &self,
        transactions: Vec<Transaction>,
        num_executor_shards: usize,
    ) -> Vec<SubBlocksForShard<Transaction>> {
        assert_eq!(1, num_executor_shards);
        let twds = transactions
            .into_iter()
            .map(|t| TransactionWithDependencies::new(t, CrossShardDependencies::default()))
            .collect();
        let sub_block = SubBlock::new(0, twds);
        let sub_block_list = SubBlocksForShard::new(0, vec![sub_block]);
        vec![sub_block_list]
    }
}
