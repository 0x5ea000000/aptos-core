// Copyright © Aptos Foundation

// @generated
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct GetTransactionsRequest {
    /// Required; start version of current stream.
    #[prost(uint64, optional, tag="1")]
    pub starting_version: ::core::option::Option<u64>,
    /// Optional; number of transactions to return in current stream.
    /// If not present, return an infinite stream of transactions.
    #[prost(uint64, optional, tag="2")]
    pub transactions_count: ::core::option::Option<u64>,
    /// Optional; number of transactions in each `TransactionsResponse` for current stream.
    /// If not present, default to 1000. If larger than 1000, request will be rejected.
    #[prost(uint64, optional, tag="3")]
    pub batch_size: ::core::option::Option<u64>,
}
/// TransactionsResponse is a batch of transactions.
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TransactionsResponse {
    /// Required; transactions data.
    #[prost(message, repeated, tag="1")]
    pub transactions: ::prost::alloc::vec::Vec<super::super::transaction::v1::Transaction>,
    /// Required; chain id.
    #[prost(uint64, optional, tag="2")]
    pub chain_id: ::core::option::Option<u64>,
}
/// Encoded file descriptor set for the `aptos.indexer.v1` package
pub const FILE_DESCRIPTOR_SET: &[u8] = &[
    0x0a, 0xa9, 0x0e, 0x0a, 0x1f, 0x61, 0x70, 0x74, 0x6f, 0x73, 0x2f, 0x69, 0x6e, 0x64, 0x65, 0x78,
    0x65, 0x72, 0x2f, 0x76, 0x31, 0x2f, 0x72, 0x61, 0x77, 0x5f, 0x64, 0x61, 0x74, 0x61, 0x2e, 0x70,
    0x72, 0x6f, 0x74, 0x6f, 0x12, 0x10, 0x61, 0x70, 0x74, 0x6f, 0x73, 0x2e, 0x69, 0x6e, 0x64, 0x65,
    0x78, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x1a, 0x26, 0x61, 0x70, 0x74, 0x6f, 0x73, 0x2f, 0x74, 0x72,
    0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x2f, 0x76, 0x31, 0x2f, 0x74, 0x72, 0x61,
    0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0xe3,
    0x01, 0x0a, 0x16, 0x47, 0x65, 0x74, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f,
    0x6e, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x32, 0x0a, 0x10, 0x73, 0x74, 0x61,
    0x72, 0x74, 0x69, 0x6e, 0x67, 0x5f, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x18, 0x01, 0x20,
    0x01, 0x28, 0x04, 0x42, 0x02, 0x30, 0x01, 0x48, 0x00, 0x52, 0x0f, 0x73, 0x74, 0x61, 0x72, 0x74,
    0x69, 0x6e, 0x67, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x88, 0x01, 0x01, 0x12, 0x36, 0x0a,
    0x12, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x5f, 0x63, 0x6f,
    0x75, 0x6e, 0x74, 0x18, 0x02, 0x20, 0x01, 0x28, 0x04, 0x42, 0x02, 0x30, 0x01, 0x48, 0x01, 0x52,
    0x11, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x43, 0x6f, 0x75,
    0x6e, 0x74, 0x88, 0x01, 0x01, 0x12, 0x22, 0x0a, 0x0a, 0x62, 0x61, 0x74, 0x63, 0x68, 0x5f, 0x73,
    0x69, 0x7a, 0x65, 0x18, 0x03, 0x20, 0x01, 0x28, 0x04, 0x48, 0x02, 0x52, 0x09, 0x62, 0x61, 0x74,
    0x63, 0x68, 0x53, 0x69, 0x7a, 0x65, 0x88, 0x01, 0x01, 0x42, 0x13, 0x0a, 0x11, 0x5f, 0x73, 0x74,
    0x61, 0x72, 0x74, 0x69, 0x6e, 0x67, 0x5f, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x42, 0x15,
    0x0a, 0x13, 0x5f, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x5f,
    0x63, 0x6f, 0x75, 0x6e, 0x74, 0x42, 0x0d, 0x0a, 0x0b, 0x5f, 0x62, 0x61, 0x74, 0x63, 0x68, 0x5f,
    0x73, 0x69, 0x7a, 0x65, 0x22, 0x8e, 0x01, 0x0a, 0x14, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63,
    0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x45, 0x0a,
    0x0c, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x18, 0x01, 0x20,
    0x03, 0x28, 0x0b, 0x32, 0x21, 0x2e, 0x61, 0x70, 0x74, 0x6f, 0x73, 0x2e, 0x74, 0x72, 0x61, 0x6e,
    0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x2e, 0x76, 0x31, 0x2e, 0x54, 0x72, 0x61, 0x6e, 0x73,
    0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x0c, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74,
    0x69, 0x6f, 0x6e, 0x73, 0x12, 0x22, 0x0a, 0x08, 0x63, 0x68, 0x61, 0x69, 0x6e, 0x5f, 0x69, 0x64,
    0x18, 0x02, 0x20, 0x01, 0x28, 0x04, 0x42, 0x02, 0x30, 0x01, 0x48, 0x00, 0x52, 0x07, 0x63, 0x68,
    0x61, 0x69, 0x6e, 0x49, 0x64, 0x88, 0x01, 0x01, 0x42, 0x0b, 0x0a, 0x09, 0x5f, 0x63, 0x68, 0x61,
    0x69, 0x6e, 0x5f, 0x69, 0x64, 0x32, 0x70, 0x0a, 0x07, 0x52, 0x61, 0x77, 0x44, 0x61, 0x74, 0x61,
    0x12, 0x65, 0x0a, 0x0f, 0x47, 0x65, 0x74, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69,
    0x6f, 0x6e, 0x73, 0x12, 0x28, 0x2e, 0x61, 0x70, 0x74, 0x6f, 0x73, 0x2e, 0x69, 0x6e, 0x64, 0x65,
    0x78, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x61,
    0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x26, 0x2e,
    0x61, 0x70, 0x74, 0x6f, 0x73, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x2e, 0x76, 0x31,
    0x2e, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x73,
    0x70, 0x6f, 0x6e, 0x73, 0x65, 0x30, 0x01, 0x4a, 0xda, 0x09, 0x0a, 0x06, 0x12, 0x04, 0x03, 0x00,
    0x22, 0x01, 0x0a, 0x4e, 0x0a, 0x01, 0x0c, 0x12, 0x03, 0x03, 0x00, 0x12, 0x32, 0x44, 0x20, 0x43,
    0x6f, 0x70, 0x79, 0x72, 0x69, 0x67, 0x68, 0x74, 0x20, 0xc2, 0xa9, 0x20, 0x41, 0x70, 0x74, 0x6f,
    0x73, 0x20, 0x46, 0x6f, 0x75, 0x6e, 0x64, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x0a, 0x20, 0x53, 0x50,
    0x44, 0x58, 0x2d, 0x4c, 0x69, 0x63, 0x65, 0x6e, 0x73, 0x65, 0x2d, 0x49, 0x64, 0x65, 0x6e, 0x74,
    0x69, 0x66, 0x69, 0x65, 0x72, 0x3a, 0x20, 0x41, 0x70, 0x61, 0x63, 0x68, 0x65, 0x2d, 0x32, 0x2e,
    0x30, 0x0a, 0x0a, 0x08, 0x0a, 0x01, 0x02, 0x12, 0x03, 0x05, 0x00, 0x19, 0x0a, 0x09, 0x0a, 0x02,
    0x03, 0x00, 0x12, 0x03, 0x07, 0x00, 0x30, 0x0a, 0x0a, 0x0a, 0x02, 0x04, 0x00, 0x12, 0x04, 0x09,
    0x00, 0x14, 0x01, 0x0a, 0x0a, 0x0a, 0x03, 0x04, 0x00, 0x01, 0x12, 0x03, 0x09, 0x08, 0x1e, 0x0a,
    0x39, 0x0a, 0x04, 0x04, 0x00, 0x02, 0x00, 0x12, 0x03, 0x0b, 0x02, 0x3c, 0x1a, 0x2c, 0x20, 0x52,
    0x65, 0x71, 0x75, 0x69, 0x72, 0x65, 0x64, 0x3b, 0x20, 0x73, 0x74, 0x61, 0x72, 0x74, 0x20, 0x76,
    0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x20, 0x6f, 0x66, 0x20, 0x63, 0x75, 0x72, 0x72, 0x65, 0x6e,
    0x74, 0x20, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x2e, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00,
    0x02, 0x00, 0x04, 0x12, 0x03, 0x0b, 0x02, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x00,
    0x05, 0x12, 0x03, 0x0b, 0x0b, 0x11, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x00, 0x01, 0x12,
    0x03, 0x0b, 0x12, 0x22, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x00, 0x03, 0x12, 0x03, 0x0b,
    0x25, 0x26, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x00, 0x08, 0x12, 0x03, 0x0b, 0x27, 0x3b,
    0x0a, 0x0d, 0x0a, 0x06, 0x04, 0x00, 0x02, 0x00, 0x08, 0x06, 0x12, 0x03, 0x0b, 0x28, 0x3a, 0x0a,
    0x88, 0x01, 0x0a, 0x04, 0x04, 0x00, 0x02, 0x01, 0x12, 0x03, 0x0f, 0x02, 0x3e, 0x1a, 0x7b, 0x20,
    0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x61, 0x6c, 0x3b, 0x20, 0x6e, 0x75, 0x6d, 0x62, 0x65, 0x72,
    0x20, 0x6f, 0x66, 0x20, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73,
    0x20, 0x74, 0x6f, 0x20, 0x72, 0x65, 0x74, 0x75, 0x72, 0x6e, 0x20, 0x69, 0x6e, 0x20, 0x63, 0x75,
    0x72, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x2e, 0x0a, 0x20, 0x49,
    0x66, 0x20, 0x6e, 0x6f, 0x74, 0x20, 0x70, 0x72, 0x65, 0x73, 0x65, 0x6e, 0x74, 0x2c, 0x20, 0x72,
    0x65, 0x74, 0x75, 0x72, 0x6e, 0x20, 0x61, 0x6e, 0x20, 0x69, 0x6e, 0x66, 0x69, 0x6e, 0x69, 0x74,
    0x65, 0x20, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x20, 0x6f, 0x66, 0x20, 0x74, 0x72, 0x61, 0x6e,
    0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x2e, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00,
    0x02, 0x01, 0x04, 0x12, 0x03, 0x0f, 0x02, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x01,
    0x05, 0x12, 0x03, 0x0f, 0x0b, 0x11, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x01, 0x01, 0x12,
    0x03, 0x0f, 0x12, 0x24, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x01, 0x03, 0x12, 0x03, 0x0f,
    0x27, 0x28, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x01, 0x08, 0x12, 0x03, 0x0f, 0x29, 0x3d,
    0x0a, 0x0d, 0x0a, 0x06, 0x04, 0x00, 0x02, 0x01, 0x08, 0x06, 0x12, 0x03, 0x0f, 0x2a, 0x3c, 0x0a,
    0xb4, 0x01, 0x0a, 0x04, 0x04, 0x00, 0x02, 0x02, 0x12, 0x03, 0x13, 0x02, 0x21, 0x1a, 0xa6, 0x01,
    0x20, 0x4f, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x61, 0x6c, 0x3b, 0x20, 0x6e, 0x75, 0x6d, 0x62, 0x65,
    0x72, 0x20, 0x6f, 0x66, 0x20, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e,
    0x73, 0x20, 0x69, 0x6e, 0x20, 0x65, 0x61, 0x63, 0x68, 0x20, 0x60, 0x54, 0x72, 0x61, 0x6e, 0x73,
    0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x60,
    0x20, 0x66, 0x6f, 0x72, 0x20, 0x63, 0x75, 0x72, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x73, 0x74, 0x72,
    0x65, 0x61, 0x6d, 0x2e, 0x0a, 0x20, 0x49, 0x66, 0x20, 0x6e, 0x6f, 0x74, 0x20, 0x70, 0x72, 0x65,
    0x73, 0x65, 0x6e, 0x74, 0x2c, 0x20, 0x64, 0x65, 0x66, 0x61, 0x75, 0x6c, 0x74, 0x20, 0x74, 0x6f,
    0x20, 0x31, 0x30, 0x30, 0x30, 0x2e, 0x20, 0x49, 0x66, 0x20, 0x6c, 0x61, 0x72, 0x67, 0x65, 0x72,
    0x20, 0x74, 0x68, 0x61, 0x6e, 0x20, 0x31, 0x30, 0x30, 0x30, 0x2c, 0x20, 0x72, 0x65, 0x71, 0x75,
    0x65, 0x73, 0x74, 0x20, 0x77, 0x69, 0x6c, 0x6c, 0x20, 0x62, 0x65, 0x20, 0x72, 0x65, 0x6a, 0x65,
    0x63, 0x74, 0x65, 0x64, 0x2e, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x02, 0x04, 0x12,
    0x03, 0x13, 0x02, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x02, 0x05, 0x12, 0x03, 0x13,
    0x0b, 0x11, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x02, 0x01, 0x12, 0x03, 0x13, 0x12, 0x1c,
    0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x00, 0x02, 0x02, 0x03, 0x12, 0x03, 0x13, 0x1f, 0x20, 0x0a, 0x3e,
    0x0a, 0x02, 0x04, 0x01, 0x12, 0x04, 0x17, 0x00, 0x1d, 0x01, 0x1a, 0x32, 0x20, 0x54, 0x72, 0x61,
    0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
    0x65, 0x20, 0x69, 0x73, 0x20, 0x61, 0x20, 0x62, 0x61, 0x74, 0x63, 0x68, 0x20, 0x6f, 0x66, 0x20,
    0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x2e, 0x0a, 0x0a, 0x0a,
    0x0a, 0x03, 0x04, 0x01, 0x01, 0x12, 0x03, 0x17, 0x08, 0x1c, 0x0a, 0x2b, 0x0a, 0x04, 0x04, 0x01,
    0x02, 0x00, 0x12, 0x03, 0x19, 0x04, 0x40, 0x1a, 0x1e, 0x20, 0x52, 0x65, 0x71, 0x75, 0x69, 0x72,
    0x65, 0x64, 0x3b, 0x20, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73,
    0x20, 0x64, 0x61, 0x74, 0x61, 0x2e, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x00, 0x04,
    0x12, 0x03, 0x19, 0x04, 0x0c, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x00, 0x06, 0x12, 0x03,
    0x19, 0x0d, 0x2d, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x00, 0x01, 0x12, 0x03, 0x19, 0x2e,
    0x3a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x00, 0x03, 0x12, 0x03, 0x19, 0x3e, 0x3f, 0x0a,
    0x22, 0x0a, 0x04, 0x04, 0x01, 0x02, 0x01, 0x12, 0x03, 0x1c, 0x04, 0x36, 0x1a, 0x15, 0x20, 0x52,
    0x65, 0x71, 0x75, 0x69, 0x72, 0x65, 0x64, 0x3b, 0x20, 0x63, 0x68, 0x61, 0x69, 0x6e, 0x20, 0x69,
    0x64, 0x2e, 0x0a, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x01, 0x04, 0x12, 0x03, 0x1c, 0x04,
    0x0c, 0x0a, 0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x01, 0x05, 0x12, 0x03, 0x1c, 0x0d, 0x13, 0x0a,
    0x0c, 0x0a, 0x05, 0x04, 0x01, 0x02, 0x01, 0x01, 0x12, 0x03, 0x1c, 0x14, 0x1c, 0x0a, 0x0c, 0x0a,
    0x05, 0x04, 0x01, 0x02, 0x01, 0x03, 0x12, 0x03, 0x1c, 0x1f, 0x20, 0x0a, 0x0c, 0x0a, 0x05, 0x04,
    0x01, 0x02, 0x01, 0x08, 0x12, 0x03, 0x1c, 0x21, 0x35, 0x0a, 0x0d, 0x0a, 0x06, 0x04, 0x01, 0x02,
    0x01, 0x08, 0x06, 0x12, 0x03, 0x1c, 0x22, 0x34, 0x0a, 0x0a, 0x0a, 0x02, 0x06, 0x00, 0x12, 0x04,
    0x1f, 0x00, 0x22, 0x01, 0x0a, 0x0a, 0x0a, 0x03, 0x06, 0x00, 0x01, 0x12, 0x03, 0x1f, 0x08, 0x0f,
    0x0a, 0x7a, 0x0a, 0x04, 0x06, 0x00, 0x02, 0x00, 0x12, 0x03, 0x21, 0x04, 0x56, 0x1a, 0x6d, 0x20,
    0x47, 0x65, 0x74, 0x20, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x73,
    0x20, 0x62, 0x61, 0x74, 0x63, 0x68, 0x20, 0x77, 0x69, 0x74, 0x68, 0x6f, 0x75, 0x74, 0x20, 0x61,
    0x6e, 0x79, 0x20, 0x66, 0x69, 0x6c, 0x74, 0x65, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x66, 0x72, 0x6f,
    0x6d, 0x20, 0x73, 0x74, 0x61, 0x72, 0x74, 0x69, 0x6e, 0x67, 0x20, 0x76, 0x65, 0x72, 0x73, 0x69,
    0x6f, 0x6e, 0x20, 0x61, 0x6e, 0x64, 0x20, 0x65, 0x6e, 0x64, 0x20, 0x69, 0x66, 0x20, 0x74, 0x72,
    0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x20,
    0x69, 0x73, 0x20, 0x70, 0x72, 0x65, 0x73, 0x65, 0x6e, 0x74, 0x2e, 0x0a, 0x0a, 0x0c, 0x0a, 0x05,
    0x06, 0x00, 0x02, 0x00, 0x01, 0x12, 0x03, 0x21, 0x08, 0x17, 0x0a, 0x0c, 0x0a, 0x05, 0x06, 0x00,
    0x02, 0x00, 0x02, 0x12, 0x03, 0x21, 0x18, 0x2e, 0x0a, 0x0c, 0x0a, 0x05, 0x06, 0x00, 0x02, 0x00,
    0x06, 0x12, 0x03, 0x21, 0x39, 0x3f, 0x0a, 0x0c, 0x0a, 0x05, 0x06, 0x00, 0x02, 0x00, 0x03, 0x12,
    0x03, 0x21, 0x40, 0x54, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
];
include!("aptos.indexer.v1.serde.rs");
include!("aptos.indexer.v1.tonic.rs");
// @@protoc_insertion_point(module)