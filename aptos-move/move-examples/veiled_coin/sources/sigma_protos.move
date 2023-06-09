/// Package for creating, verifying, serializing & deserializing the $\Sigma$-protocol proofs used in veiled coins.
///
/// # Preliminaries
///
/// Recall that a $\Sigma$-protocol proof argues knowledge of a *secret* witness $w$ such that an arithmetic relation
/// $R(x; w) = 1$ is satisfied over group and field elements stored in $x$ and $w$.
///
/// Here, $x$ is a public statement known to the verifier (i.e., known to the validators). Importantly, the
/// $\Sigma$-protocol's zero-knowledge property ensures the witness $w$ remains secret.
///
/// # WithdrawalSubproof: ElGamal-Pedersen equality
///
/// This proof is used to provable convert an ElGamal ciphertext to a Pedersen commitment over which a ZK range proof
/// can be securely computed. Otherwise, knowledge of the ElGamal SK breaks the binding of the 2nd component of the
/// ElGamal ciphertext, making any ZK range proof over it useless.
///
/// The secret witness $w$ in this relation, known only to the sender of the TXN, consists of:
///  - $b$, sender's new balance, after the withdrawal from their veiled balance
///  - $r$, randomness used to ElGamal-encrypt the sender's balance
///
/// (Note that the $\Sigma$-protocol's zero-knowledge property ensures the witness is not revealed.)
///
/// The public statement $x$ in this relation consists of:
///  - $G$, basepoint of a given elliptic curve
///  - $H$, basepoint used for randomness in the Pedersen commitments
///  - $Y$, sender's PK
///  - $(c_1, c_2)$, ElGamal encryption of $b$ with randomness $r$
///  - $c$, Pedersen commitment to $b$ with randomness $r$
///
/// The relation being proved is as follows:
///
/// ```
/// R(
///     x = [ Y, (c_1, c_2), c, G, H]
///     w = [ b, r ]
/// ) = {
///     c1 = r G
///     c2 = b G + r Y
///     c  = b G + r H
/// }
/// ```
///
/// # TransferSubproof: ElGamal-Pedersen equality and ElGamal-ElGamal equality
///
/// This protocol argues two things. First, that the same amount is ElGamal-encrypted for both the sender and recipient.
/// This is needed to correctly withdraw & deposit the same amount during a transfer. Second, that this same amount is
/// committed via Pedersen. Third, that a Pedersen-committed balance is correctly ElGamal encrypted. ZK range proofs
/// are computed over these last two Pedersen commitments, to prevent overflowing attacks on the balance.
///
/// The secret witness $w$ in this relation, known only to the sender of the TXN, consists of:
///  - $v$, amount being transferred
///  - $r$, randomness used to ElGamal-encrypt $v$
///  - $b$, sender's new balance after the transfer occurs
///  - $r_b$, randomness used to ElGamal-encrypt $b$
///
/// The public statement $x$ in this relation consists of:
///  - Public parameters
///    + $G$, basepoint of a given elliptic curve
///    + $H$, basepoint used for randomness in the Pedersen commitments
///  - PKs
///    + $Y$, sender's PK
///    + $Y'$, recipient's PK
///  - Amount encryption & commitment
///    + $(C, D)$, ElGamal encryption of $v$, under the sender's PK, using randomness $r$
///    + $(C', D)$, ElGamal encryption of $v$, under the recipient's PK, using randomness $r$
///    + $c$, Pedersen commitment to $v$ using randomness $r$
///  - New balance encryption & commitment
///    + $(c_1, c_2)$, ElGamal encryption of $b$, under the sender's PK, using randomness $r_b$
///    + $c'$, Pedersen commitment to $b$ using randomness $r_b$
///
/// The relation being proved is:
/// ```
/// R(
///     x = [ Y, Y', (C, C', D), c, (c_1, c_2), c', G, H]
///     w = [ v, r, b, r_b ]
/// ) = {
///     C  = v G + r Y
///     C' = v G + r Y'
///     D = r G
///     c_1 =   b G + r_b Y
///     c_2 = r_b G
///     c  = b G + r_b H
///     c' = v G +   r H
/// }
/// ```
///
/// A relation similar to this is also described on page 14 of the Zether paper [BAZB20] (just replace  $G$ -> $g$,
/// $C'$ -> $\bar{C}$, $Y$ -> $y$, $Y'$ -> $\bar{y}$, $v$ -> $b^*$). Note that their relation does not include the
/// ElGamal-to-Pedersen conversion parts, as they can do ZK range proofs directly over ElGamal ciphertexts using their
/// $\Sigma$-bullets modification of Bulletproofs.
///
/// Note also that the equations $C_L - C = b' G + sk (C_R - D)$ and $Y = sk G$ in the Zether paper are enforced
/// programmatically by this smart contract and so are not needed in our $\Sigma$-protocol.
module veiled_coin::sigma_protos {
    use std::error;
    use std::option::Option;
    use std::vector;

    use aptos_std::elgamal;
    use aptos_std::pedersen;
    use aptos_std::ristretto255::{Self, RistrettoPoint, Scalar};

    use veiled_coin::helpers::cut_vector;

    #[test_only]
    use veiled_coin::helpers::generate_elgamal_keypair;

    //
    // Errors
    //

    /// The $\Sigma$-protocol proof for withdrawals did not verify.
    const ESIGMA_PROTOCOL_VERIFY_FAILED: u64 = 1;

    //
    // Constants
    //

    /// The domain separation tag (DST) used in the Fiat-Shamir transform of our $\Sigma$-protocol.
    const FIAT_SHAMIR_SIGMA_DST : vector<u8> = b"AptosVeiledCoin/WithdrawalSubproofFiatShamir";

    //
    // Structs
    //

    /// A $\Sigma$-protocol used during an unveiled withdrawal (for proving the correct ElGamal encryption of a
    /// Pedersen-committed balance).
    struct WithdrawalSubproof has drop {
        x1: RistrettoPoint,
        x2: RistrettoPoint,
        x3: RistrettoPoint,
        alpha1: Scalar,
        alpha2: Scalar,
    }

    /// A $\Sigma$-protocol proof used during a veiled transfer. This proof encompasses the $\Sigma$-protocol from
    /// `WithdrawalSubproof`.
    struct TransferSubproof has drop {
        x1: RistrettoPoint,
        x2: RistrettoPoint,
        x3: RistrettoPoint,
        x4: RistrettoPoint,
        x5: RistrettoPoint,
        x6: RistrettoPoint,
        x7: RistrettoPoint,
        alpha1: Scalar,
        alpha2: Scalar,
        alpha3: Scalar,
        alpha4: Scalar,
    }

    //
    // Public proof verification functions
    //

    /// Verifies a $\Sigma$-protocol proof necessary to ensure correctness of a veiled transfer.
    ///
    /// Specifically, the proof argues that the same amount $v$ is Pedersen-committed in `comm_amount` and ElGamal-
    /// encrypted in `withdraw_ct` (under `sender_pk`) and in `deposit_ct` (under `recipient_pk`), all three using the
    /// same randomness $r$.
    ///
    /// In addition, it argues that the same balance $b$ is ElGamal-encrypted in `sender_new_balance_ct` under
    /// `sender_pk` and Pedersen-committed in `sender_new_balance_comm`, both with the same randomness $r_b$.
    public fun verify_transfer_subproof(
        sender_pk: &elgamal::CompressedPubkey,
        recipient_pk: &elgamal::CompressedPubkey,
        withdraw_ct: &elgamal::Ciphertext,
        deposit_ct: &elgamal::Ciphertext,
        comm_amount: &pedersen::Commitment,
        sender_new_balance_ct: &elgamal::Ciphertext,
        sender_new_balance_comm: &pedersen::Commitment,
        proof: &TransferSubproof)
    {
        let h = pedersen::randomness_base_for_bulletproof();
        let sender_pk_point = elgamal::pubkey_to_point(sender_pk);
        let recipient_pk_point = elgamal::pubkey_to_point(recipient_pk);
        let (big_c, big_d) = elgamal::ciphertext_as_points(withdraw_ct);
        let (big_c_prime, _) = elgamal::ciphertext_as_points(deposit_ct);
        let c = pedersen::commitment_as_point(comm_amount);
        let (c1, c2) = elgamal::ciphertext_as_points(sender_new_balance_ct);
        let c_prime = pedersen::commitment_as_point(sender_new_balance_comm);

        // TODO: Can be optimized so we don't re-serialize the proof for Fiat-Shamir
        let rho = fiat_shamir_transfer_subproof_challenge(
            sender_pk, recipient_pk,
            withdraw_ct, deposit_ct, comm_amount,
            sender_new_balance_ct, sender_new_balance_comm,
            &proof.x1, &proof.x2, &proof.x3, &proof.x4,
            &proof.x5, &proof.x6, &proof.x7);

        let g_alpha2 = ristretto255::basepoint_mul(&proof.alpha2);
        // \rho * D + X1 =? \alpha_2 * g
        let d_acc = ristretto255::point_mul(big_d, &rho);
        ristretto255::point_add_assign(&mut d_acc, &proof.x1);
        assert!(ristretto255::point_equals(&d_acc, &g_alpha2), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        let g_alpha1 = ristretto255::basepoint_mul(&proof.alpha1);
        // \rho * C + X2 =? \alpha_1 * g + \alpha_2 * y
        let big_c_acc = ristretto255::point_mul(big_c, &rho);
        ristretto255::point_add_assign(&mut big_c_acc, &proof.x2);
        let y_alpha2 = ristretto255::point_mul(&sender_pk_point, &proof.alpha2);
        ristretto255::point_add_assign(&mut y_alpha2, &g_alpha1);
        assert!(ristretto255::point_equals(&big_c_acc, &y_alpha2), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        // \rho * \bar{C} + X3 =? \alpha_1 * g + \alpha_2 * \bar{y}
        let big_bar_c_acc = ristretto255::point_mul(big_c_prime, &rho);
        ristretto255::point_add_assign(&mut big_bar_c_acc, &proof.x3);
        let y_bar_alpha2 = ristretto255::point_mul(&recipient_pk_point, &proof.alpha2);
        ristretto255::point_add_assign(&mut y_bar_alpha2, &g_alpha1);
        assert!(ristretto255::point_equals(&big_bar_c_acc, &y_bar_alpha2), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        let g_alpha3 = ristretto255::basepoint_mul(&proof.alpha3);
        // \rho * c_1 + X4 =? \alpha_3 * g + \alpha_4 * y
        let c1_acc = ristretto255::point_mul(c1, &rho);
        ristretto255::point_add_assign(&mut c1_acc, &proof.x4);
        let y_alpha4 = ristretto255::point_mul(&sender_pk_point, &proof.alpha4);
        ristretto255::point_add_assign(&mut y_alpha4, &g_alpha3);
        assert!(ristretto255::point_equals(&c1_acc, &y_alpha4), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        let g_alpha4 = ristretto255::basepoint_mul(&proof.alpha4);
        // \rho * c_2 + X5 =? \alpha_4 * g
        let c2_acc = ristretto255::point_mul(c2, &rho);
        ristretto255::point_add_assign(&mut c2_acc, &proof.x5);
        assert!(ristretto255::point_equals(&c2_acc, &g_alpha4), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        // \rho * c + X6 =? \alpha_3 * g + \alpha_4 * h
        let c_acc = ristretto255::point_mul(c_prime, &rho);
        ristretto255::point_add_assign(&mut c_acc, &proof.x6);
        let h_alpha4 = ristretto255::point_mul(&h, &proof.alpha4);
        ristretto255::point_add_assign(&mut h_alpha4, &g_alpha3);
        assert!(ristretto255::point_equals(&c_acc, &h_alpha4), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        // \rho * \bar{c} + X7 =? \alpha_1 * g + \alpha_2 * h
        let bar_c_acc = ristretto255::point_mul(c, &rho);
        ristretto255::point_add_assign(&mut bar_c_acc, &proof.x7);
        let h_alpha2 = ristretto255::point_mul(&h, &proof.alpha2);
        ristretto255::point_add_assign(&mut h_alpha2, &g_alpha1);
        assert!(ristretto255::point_equals(&bar_c_acc, &h_alpha2), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));
    }

    /// Verifies the $\Sigma$-protocol proof necessary to ensure correctness of a veiled-to-unveiled transfer.
    ///
    /// Specifically, the proof argues that the same amount $v$ is Pedersen-committed in `sender_new_balance_comm` and
    /// ElGamal-encrypted in `sender_new_balance_ct` (under `sender_pk`), both using the same randomness $r$.
    public fun verify_withdrawal_subproof(
        sender_pk: &elgamal::CompressedPubkey,
        sender_new_balance_ct: &elgamal::Ciphertext,
        sender_new_balance_comm: &pedersen::Commitment,
        proof: &WithdrawalSubproof)
    {
        let h = pedersen::randomness_base_for_bulletproof();
        let sender_pk_point = elgamal::pubkey_to_point(sender_pk);
        let (c1, c2) = elgamal::ciphertext_as_points(sender_new_balance_ct);
        let c = pedersen::commitment_as_point(sender_new_balance_comm);

        let rho = fiat_shamir_withdrawal_subproof_challenge(
            sender_pk,
            sender_new_balance_ct,
            sender_new_balance_comm,
            &proof.x1,
            &proof.x2,
            &proof.x3);

        let g_alpha1 = ristretto255::basepoint_mul(&proof.alpha1);
        // \rho * c_2 + X_1 =? \alpha_1 * g
        let c2_acc = ristretto255::point_mul(c2, &rho);
        ristretto255::point_add_assign(&mut c2_acc, &proof.x1);
        assert!(ristretto255::point_equals(&c2_acc, &g_alpha1), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        let g_alpha2 = ristretto255::basepoint_mul(&proof.alpha2);
        // \rho * c_1 + X_2 =? \alpha_2 * g + \alpha_1 * y
        let c1_acc = ristretto255::point_mul(c1, &rho);
        ristretto255::point_add_assign(&mut c1_acc, &proof.x2);
        let y_alpha1 = ristretto255::point_mul(&sender_pk_point, &proof.alpha1);
        ristretto255::point_add_assign(&mut y_alpha1, &g_alpha2);
        assert!(ristretto255::point_equals(&c1_acc, &y_alpha1), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));

        // \rho * c + X_3 =? \alpha_2 * g + \alpha_1 * h
        let c_acc = ristretto255::point_mul(c, &rho);
        ristretto255::point_add_assign(&mut c_acc, &proof.x3);
        let h_alpha1 = ristretto255::point_mul(&h, &proof.alpha1);
        ristretto255::point_add_assign(&mut h_alpha1, &g_alpha2);
        assert!(ristretto255::point_equals(&c_acc, &h_alpha1), error::invalid_argument(ESIGMA_PROTOCOL_VERIFY_FAILED));
    }

    //
    // Public deserialization functions
    //

    /// Deserializes and returns an `WithdrawalSubproof` given its byte representation.
    public fun deserialize_withdrawal_subproof(proof_bytes: vector<u8>): Option<WithdrawalSubproof> {
        if (vector::length<u8>(&proof_bytes) != 160) {
            return std::option::none<WithdrawalSubproof>()
        };

        let x1_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x1 = ristretto255::new_point_from_bytes(x1_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x1)) {
            return std::option::none<WithdrawalSubproof>()
        };
        let x1 = std::option::extract<RistrettoPoint>(&mut x1);

        let x2_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x2 = ristretto255::new_point_from_bytes(x2_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x2)) {
            return std::option::none<WithdrawalSubproof>()
        };
        let x2 = std::option::extract<RistrettoPoint>(&mut x2);

        let x3_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x3 = ristretto255::new_point_from_bytes(x3_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x3)) {
            return std::option::none<WithdrawalSubproof>()
        };
        let x3 = std::option::extract<RistrettoPoint>(&mut x3);

        let alpha1_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let alpha1 = ristretto255::new_scalar_from_bytes(alpha1_bytes);
        if (!std::option::is_some(&alpha1)) {
            return std::option::none<WithdrawalSubproof>()
        };
        let alpha1 = std::option::extract(&mut alpha1);

        let alpha2_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let alpha2 = ristretto255::new_scalar_from_bytes(alpha2_bytes);
        if (!std::option::is_some(&alpha2)) {
            return std::option::none<WithdrawalSubproof>()
        };
        let alpha2 = std::option::extract(&mut alpha2);

        std::option::some(WithdrawalSubproof {
            x1, x2, x3, alpha1, alpha2
        })
    }

    /// Deserializes and returns a `TransferSubproof` given its byte representation.
    public fun deserialize_transfer_subproof(proof_bytes: vector<u8>): Option<TransferSubproof> {
        if (vector::length<u8>(&proof_bytes) != 352) {
            return std::option::none<TransferSubproof>()
        };

        let x1_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x1 = ristretto255::new_point_from_bytes(x1_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x1)) {
            return std::option::none<TransferSubproof>()
        };
        let x1 = std::option::extract<RistrettoPoint>(&mut x1);

        let x2_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x2 = ristretto255::new_point_from_bytes(x2_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x2)) {
            return std::option::none<TransferSubproof>()
        };
        let x2 = std::option::extract<RistrettoPoint>(&mut x2);

        let x3_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x3 = ristretto255::new_point_from_bytes(x3_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x3)) {
            return std::option::none<TransferSubproof>()
        };
        let x3 = std::option::extract<RistrettoPoint>(&mut x3);

        let x4_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x4 = ristretto255::new_point_from_bytes(x4_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x4)) {
            return std::option::none<TransferSubproof>()
        };
        let x4 = std::option::extract<RistrettoPoint>(&mut x4);

        let x5_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x5 = ristretto255::new_point_from_bytes(x5_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x5)) {
            return std::option::none<TransferSubproof>()
        };
        let x5 = std::option::extract<RistrettoPoint>(&mut x5);

        let x6_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x6 = ristretto255::new_point_from_bytes(x6_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x6)) {
            return std::option::none<TransferSubproof>()
        };
        let x6 = std::option::extract<RistrettoPoint>(&mut x6);

        let x7_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let x7 = ristretto255::new_point_from_bytes(x7_bytes);
        if (!std::option::is_some<RistrettoPoint>(&x7)) {
            return std::option::none<TransferSubproof>()
        };
        let x7 = std::option::extract<RistrettoPoint>(&mut x7);

        let alpha1_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let alpha1 = ristretto255::new_scalar_from_bytes(alpha1_bytes);
        if (!std::option::is_some(&alpha1)) {
            return std::option::none<TransferSubproof>()
        };
        let alpha1 = std::option::extract(&mut alpha1);

        let alpha2_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let alpha2 = ristretto255::new_scalar_from_bytes(alpha2_bytes);
        if (!std::option::is_some(&alpha2)) {
            return std::option::none<TransferSubproof>()
        };
        let alpha2 = std::option::extract(&mut alpha2);

        let alpha3_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let alpha3 = ristretto255::new_scalar_from_bytes(alpha3_bytes);
        if (!std::option::is_some(&alpha3)) {
            return std::option::none<TransferSubproof>()
        };
        let alpha3 = std::option::extract(&mut alpha3);

        let alpha4_bytes = cut_vector<u8>(&mut proof_bytes, 32);
        let alpha4 = ristretto255::new_scalar_from_bytes(alpha4_bytes);
        if (!std::option::is_some(&alpha4)) {
            return std::option::none<TransferSubproof>()
        };
        let alpha4 = std::option::extract(&mut alpha4);

        std::option::some(TransferSubproof {
            x1, x2, x3, x4, x5, x6, x7, alpha1, alpha2, alpha3, alpha4
        })
    }

    //
    // Private functions for Fiat-Shamir challenge derivation
    //

    /// Computes a Fiat-Shamir challenge `rho = H(G, H, Y, c_1, c_2, c, x_1, x_2, x_3)` for the `WithdrawalSubproof`
    /// $\Sigma$-protocol.
    fun fiat_shamir_withdrawal_subproof_challenge(
        sender_pk: &elgamal::CompressedPubkey,
        sender_new_balance_ct: &elgamal::Ciphertext,
        sender_new_balance_comm: &pedersen::Commitment,
        x1: &RistrettoPoint,
        x2: &RistrettoPoint,
        x3: &RistrettoPoint): Scalar
    {
        let y = elgamal::pubkey_to_compressed_point(sender_pk);
        let (c1, c2) = elgamal::ciphertext_as_points(sender_new_balance_ct);
        let c = pedersen::commitment_as_point(sender_new_balance_comm);

        let bytes = vector::empty<u8>();

        vector::append<u8>(&mut bytes, FIAT_SHAMIR_SIGMA_DST);
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::basepoint_compressed()));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(
            &ristretto255::point_compress(&pedersen::randomness_base_for_bulletproof())));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&y));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c1)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c2)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x1)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x2)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x3)));

        ristretto255::new_scalar_from_sha2_512(bytes)
    }

    /// Computes a Fiat-Shamir challenge `rho = H(G, H, Y, Y', C, C', D, c, c_1, c_2, c', {X_i}_{i=1}^7)` for the
    /// `TransferSubproof` $\Sigma$-protocol.
    fun fiat_shamir_transfer_subproof_challenge(
        sender_pk: &elgamal::CompressedPubkey,
        recipient_pk: &elgamal::CompressedPubkey,
        withdraw_ct: &elgamal::Ciphertext,
        deposit_ct: &elgamal::Ciphertext,
        comm_amount: &pedersen::Commitment,
        sender_new_balance_ct: &elgamal::Ciphertext,
        sender_new_balance_comm: &pedersen::Commitment,
        x1: &RistrettoPoint,
        x2: &RistrettoPoint,
        x3: &RistrettoPoint,
        x4: &RistrettoPoint,
        x5: &RistrettoPoint,
        x6: &RistrettoPoint,
        x7: &RistrettoPoint): Scalar
    {
        let y = elgamal::pubkey_to_compressed_point(sender_pk);
        let y_prime = elgamal::pubkey_to_compressed_point(recipient_pk);
        let (big_c, big_d) = elgamal::ciphertext_as_points(withdraw_ct);
        let (big_c_prime, _) = elgamal::ciphertext_as_points(deposit_ct);
        let c = pedersen::commitment_as_point(comm_amount);
        let (c1, c2) = elgamal::ciphertext_as_points(sender_new_balance_ct);
        let c_prime = pedersen::commitment_as_point(sender_new_balance_comm);

        let bytes = vector::empty<u8>();

        vector::append<u8>(&mut bytes, FIAT_SHAMIR_SIGMA_DST);
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::basepoint_compressed()));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(
            &ristretto255::point_compress(&pedersen::randomness_base_for_bulletproof())));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&y));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&y_prime));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(big_c)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(big_c_prime)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(big_d)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c1)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c2)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(c_prime)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x1)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x2)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x3)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x4)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x5)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x6)));
        vector::append<u8>(&mut bytes, ristretto255::point_to_bytes(&ristretto255::point_compress(x7)));

        ristretto255::new_scalar_from_sha2_512(bytes)
    }

    //
    // Test-only serialization & proving functions
    //

    #[test_only]
    /// Proves the $\Sigma$-protocol used for veiled-to-unveiled coin transfers.
    /// See top-level comments for a detailed description of the $\Sigma$-protocol
    public fun prove_withdrawal(
        sender_pk: &elgamal::CompressedPubkey,
        sender_new_balance_ct: &elgamal::Ciphertext,
        sender_new_balance_comm: &pedersen::Commitment,
        new_balance_rand: &Scalar,
        new_balance_val: &Scalar): WithdrawalSubproof
    {
        let x1 = ristretto255::random_scalar();
        let x2 = ristretto255::random_scalar();
        let source_pk_point = elgamal::pubkey_to_point(sender_pk);
        let h = pedersen::randomness_base_for_bulletproof();

        // X1 <- x1 * g
        let big_x1 = ristretto255::basepoint_mul(&x1);

        let g_x2 = ristretto255::basepoint_mul(&x2);
        // X2 <- x2 * g + x1 * y
        let big_x2 = ristretto255::point_mul(&source_pk_point, &x1);
        ristretto255::point_add_assign(&mut big_x2, &g_x2);

        // X3 <- x2 * g + x1 * h
        let big_x3 = ristretto255::point_mul(&h, &x1);
        ristretto255::point_add_assign(&mut big_x3, &g_x2);

        let rho = fiat_shamir_withdrawal_subproof_challenge(
            sender_pk,
            sender_new_balance_ct,
            sender_new_balance_comm,
            &big_x1,
            &big_x2,
            &big_x3);

        // alpha_1 <- x1 + rho * r
        let alpha1 = ristretto255::scalar_mul(&rho, new_balance_rand);
        ristretto255::scalar_add_assign(&mut alpha1, &x1);

        // alpha2 <- x2 + rho * b
        let alpha2 = ristretto255::scalar_mul(&rho, new_balance_val);
        ristretto255::scalar_add_assign(&mut alpha2, &x2);

        WithdrawalSubproof {
            x1: big_x1,
            x2: big_x2,
            x3: big_x3,
            alpha1,
            alpha2,
        }
    }

    #[test_only]
    /// Proves the $\Sigma$-protocol used for veiled coin transfers.
    /// See top-level comments for a detailed description of the $\Sigma$-protocol
    public fun prove_transfer(
        sender_pk: &elgamal::CompressedPubkey,
        recipient_pk: &elgamal::CompressedPubkey,
        withdraw_ct: &elgamal::Ciphertext,
        deposit_ct: &elgamal::Ciphertext,
        comm_amount: &pedersen::Commitment,
        sender_new_balance_ct: &elgamal::Ciphertext,
        sender_new_balance_comm: &pedersen::Commitment,
        amount_rand: &Scalar,
        amount_val: &Scalar,
        new_balance_rand: &Scalar,
        new_balance_val: &Scalar): TransferSubproof
    {
        let x1 = ristretto255::random_scalar();
        let x2 = ristretto255::random_scalar();
        let x3 = ristretto255::random_scalar();
        let x4 = ristretto255::random_scalar();
        let source_pk_point = elgamal::pubkey_to_point(sender_pk);
        let recipient_pk_point = elgamal::pubkey_to_point(recipient_pk);
        let h = pedersen::randomness_base_for_bulletproof();

        // X1 <- x2 * g
        let big_x1 = ristretto255::basepoint_mul(&x2);

        // X2 <- x1 * g + x2 * y
        let big_x2 = ristretto255::basepoint_mul(&x1);
        let source_pk_x2 = ristretto255::point_mul(&source_pk_point, &x2);
        ristretto255::point_add_assign(&mut big_x2, &source_pk_x2);

        // X3 <- x1 * g + x2 * \bar{y}
        let big_x3 = ristretto255::basepoint_mul(&x1);
        let recipient_pk_x2 = ristretto255::point_mul(&recipient_pk_point, &x2);
        ristretto255::point_add_assign(&mut big_x3, &recipient_pk_x2);

        // X4 <- x3 * g + x4 * y
        let big_x4 = ristretto255::basepoint_mul(&x3);
        let source_pk_x4 = ristretto255::point_mul(&source_pk_point, &x4);
        ristretto255::point_add_assign(&mut big_x4, &source_pk_x4);

        // X5 <- x4 * g
        let big_x5 = ristretto255::basepoint_mul(&x4);

        // X6 <- x3 * g + x4 * h
        let big_x6 = ristretto255::basepoint_mul(&x3);
        let h_x4 = ristretto255::point_mul(&h, &x4);
        ristretto255::point_add_assign(&mut big_x6, &h_x4);

        // X7 <- x1 * g + x2 * h
        let big_x7 = ristretto255::basepoint_mul(&x1);
        let h_x2 = ristretto255::point_mul(&h, &x2);
        ristretto255::point_add_assign(&mut big_x7, &h_x2);


        let rho = fiat_shamir_transfer_subproof_challenge(
            sender_pk, recipient_pk,
            withdraw_ct, deposit_ct, comm_amount,
            sender_new_balance_ct, sender_new_balance_comm,
            &big_x1, &big_x2, &big_x3, &big_x4,
            &big_x5, &big_x6, &big_x7);

        // alpha_1 <- x1 + rho * v
        let alpha1 = ristretto255::scalar_mul(&rho, amount_val);
        ristretto255::scalar_add_assign(&mut alpha1, &x1);

        // alpha_2 <- x2 + rho * r
        let alpha2 = ristretto255::scalar_mul(&rho, amount_rand);
        ristretto255::scalar_add_assign(&mut alpha2, &x2);

        // alpha_3 <- x3 + rho * b
        let alpha3 = ristretto255::scalar_mul(&rho, new_balance_val);
        ristretto255::scalar_add_assign(&mut alpha3, &x3);

        // alpha_4 <- x4 + rho * r_b
        let alpha4 = ristretto255::scalar_mul(&rho, new_balance_rand);
        ristretto255::scalar_add_assign(&mut alpha4, &x4);

        TransferSubproof {
            x1: big_x1,
            x2: big_x2,
            x3: big_x3,
            x4: big_x4,
            x5: big_x5,
            x6: big_x6,
            x7: big_x7,
            alpha1,
            alpha2,
            alpha3,
            alpha4,
        }
    }

    #[test_only]
    /// Given a $\Sigma$-protocol proof for veiled-to-unveiled transfers, serializes it into byte form.
    public fun serialize_withdrawal_subproof(proof: &WithdrawalSubproof): vector<u8> {
        // Reverse-iterates through the fields of the `WithdrawalSubproof` struct, serializes each field, and appends
        // it into a vector of bytes which is returned at the end.
        let x1_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x1));
        let x2_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x2));
        let x3_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x3));
        let alpha1_bytes = ristretto255::scalar_to_bytes(&proof.alpha1);
        let alpha2_bytes = ristretto255::scalar_to_bytes(&proof.alpha2);

        let bytes = vector::empty<u8>();
        vector::append<u8>(&mut bytes, alpha2_bytes);
        vector::append<u8>(&mut bytes, alpha1_bytes);
        vector::append<u8>(&mut bytes, x3_bytes);
        vector::append<u8>(&mut bytes, x2_bytes);
        vector::append<u8>(&mut bytes, x1_bytes);

        bytes
    }

    #[test_only]
    /// Given a $\Sigma$-protocol proof, serializes it into byte form.
    public fun serialize_transfer_subproof(proof: &TransferSubproof): vector<u8> {
        // Reverse-iterates through the fields of the `TransferSubproof` struct, serializes each field, and appends
        // it into a vector of bytes which is returned at the end.
        let x1_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x1));
        let x2_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x2));
        let x3_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x3));
        let x4_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x4));
        let x5_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x5));
        let x6_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x6));
        let x7_bytes = ristretto255::point_to_bytes(&ristretto255::point_compress(&proof.x7));
        let alpha1_bytes = ristretto255::scalar_to_bytes(&proof.alpha1);
        let alpha2_bytes = ristretto255::scalar_to_bytes(&proof.alpha2);
        let alpha3_bytes = ristretto255::scalar_to_bytes(&proof.alpha3);
        let alpha4_bytes = ristretto255::scalar_to_bytes(&proof.alpha4);

        let bytes = vector::empty<u8>();
        vector::append<u8>(&mut bytes, alpha4_bytes);
        vector::append<u8>(&mut bytes, alpha3_bytes);
        vector::append<u8>(&mut bytes, alpha2_bytes);
        vector::append<u8>(&mut bytes, alpha1_bytes);
        vector::append<u8>(&mut bytes, x7_bytes);
        vector::append<u8>(&mut bytes, x6_bytes);
        vector::append<u8>(&mut bytes, x5_bytes);
        vector::append<u8>(&mut bytes, x4_bytes);
        vector::append<u8>(&mut bytes, x3_bytes);
        vector::append<u8>(&mut bytes, x2_bytes);
        vector::append<u8>(&mut bytes, x1_bytes);

        bytes
    }

    //
    // Sigma proof verification tests
    //

    #[test_only]
    fun verify_transfer_subproof_test(maul_proof: bool)
    {
        // Pick a keypair for the sender, and one for the recipient
        let (_, sender_pk) = generate_elgamal_keypair();
        let (_, recipient_pk) = generate_elgamal_keypair();

        // Set the transferred amount to 50
        let amount_val = ristretto255::new_scalar_from_u32(50);
        let amount_rand = ristretto255::random_scalar();

        // Encrypt the amount under the sender's PK
        let withdraw_ct = elgamal::new_ciphertext_with_basepoint(&amount_val, &amount_rand, &sender_pk);
        // Encrypt the amount under the recipient's PK
        let deposit_ct = elgamal::new_ciphertext_with_basepoint(&amount_val, &amount_rand, &recipient_pk);
        // Commit to the amount
        let comm_amount = pedersen::new_commitment_for_bulletproof(&amount_val, &amount_rand);

        // Set sender's new balance after the transaction to 100
        let new_balance_val = ristretto255::new_scalar_from_u32(100);
        let new_balance_rand = ristretto255::random_scalar();
        let new_balance_ct = elgamal::new_ciphertext_with_basepoint(&new_balance_val, &new_balance_rand, &sender_pk);

        let new_balance_comm = pedersen::new_commitment_for_bulletproof(&new_balance_val, &new_balance_rand);

        let sigma_proof = prove_transfer(
            &sender_pk,
            &recipient_pk,
            &withdraw_ct,           // withdrawn amount, encrypted under sender PK
            &deposit_ct,            // deposited amount, encrypted under recipient PK (same plaintext as `withdraw_ct`)
            &comm_amount,            // commitment to transfer amount to prevent range proof forgery
            &new_balance_ct,    // sender's balance after the transaction goes through, encrypted under sender PK
            &new_balance_comm,  // commitment to sender's balance to prevent range proof forgery
            &amount_rand,           // encryption randomness for `withdraw_ct` and `deposit_ct`
            &amount_val,            // transferred amount
            &new_balance_rand,  // encryption randomness for updated balance ciphertext
            &new_balance_val,   // sender's balance after the transfer
        );

        if (maul_proof) {
            // This should fail the proof verification below
            let random_point = ristretto255::random_point();
            sigma_proof.x1 = random_point;
        };

        verify_transfer_subproof(
            &sender_pk,
            &recipient_pk,
            &withdraw_ct,
            &deposit_ct,
            &comm_amount,
            &new_balance_ct,
            &new_balance_comm,
            &sigma_proof
        );
    }

    #[test]
    fun verify_transfer_subproof_succeeds_test() {
        verify_transfer_subproof_test(false);
    }

    #[test]
    #[expected_failure(abort_code = 0x10001, location = Self)]
    fun verify_transfer_subproof_fails_test()
    {
        verify_transfer_subproof_test(true);
    }

    #[test_only]
    fun verify_withdrawal_subproof_test(maul_proof: bool)
    {
        // Pick a keypair for the sender
        let (_, sender_pk) = generate_elgamal_keypair();

        // Set the transferred amount to 50
        let balance = ristretto255::new_scalar_from_u32(50);
        let rand = ristretto255::random_scalar();

        // Encrypt the amount under the sender's PK
        let balance_ct = elgamal::new_ciphertext_with_basepoint(&balance, &rand, &sender_pk);
        // Commit to the amount
        let balance_comm = pedersen::new_commitment_for_bulletproof(&balance, &rand);

        let sigma_proof = prove_withdrawal(
            &sender_pk,
            &balance_ct,
            &balance_comm,
            &rand,
            &balance,
        );

        if (maul_proof) {
            // This should fail the proof verification below
            let random_point = ristretto255::random_point();
            sigma_proof.x1 = random_point;
        };

        verify_withdrawal_subproof(
            &sender_pk,
            &balance_ct,
            &balance_comm,
            &sigma_proof
        );
    }

    #[test]
    fun verify_withdrawal_subproof_succeeds_test() {
        verify_withdrawal_subproof_test(false);
    }

    #[test]
    #[expected_failure(abort_code = 0x10001, location = Self)]
    fun verify_withdrawal_subproof_fails_test() {
        verify_withdrawal_subproof_test(true);
    }

    //
    // Sigma proof deserialization tests
    //

    #[test]
    fun serialize_transfer_subproof_test()
    {
        let (_, sender_pk) = generate_elgamal_keypair();
        let amount_val = ristretto255::new_scalar_from_u32(50);
        let (_, recipient_pk) = generate_elgamal_keypair();
        let amount_rand = ristretto255::random_scalar();
        let withdraw_ct = elgamal::new_ciphertext_with_basepoint(&amount_val, &amount_rand, &sender_pk);
        let deposit_ct = elgamal::new_ciphertext_with_basepoint(&amount_val, &amount_rand, &recipient_pk);
        let comm_amount = pedersen::new_commitment_for_bulletproof(&amount_val, &amount_rand);
        let new_balance_val = ristretto255::new_scalar_from_u32(100);
        let new_balance_rand = ristretto255::random_scalar();
        let new_balance_ct = elgamal::new_ciphertext_with_basepoint(&new_balance_val, &new_balance_rand, &sender_pk);
        let new_balance_comm = pedersen::new_commitment_for_bulletproof(&new_balance_val, &new_balance_rand);

        let sigma_proof = prove_transfer(
            &sender_pk,
            &recipient_pk,
            &withdraw_ct,
            &deposit_ct,
            &comm_amount,
            &new_balance_ct,
            &new_balance_comm,
            &amount_rand,
            &amount_val,
            &new_balance_rand,
            &new_balance_val);

        let sigma_proof_bytes = serialize_transfer_subproof(&sigma_proof);

        let deserialized_proof = std::option::extract<TransferSubproof>(&mut deserialize_transfer_subproof(sigma_proof_bytes));

        assert!(ristretto255::point_equals(&sigma_proof.x1, &deserialized_proof.x1), 1);
        assert!(ristretto255::point_equals(&sigma_proof.x2, &deserialized_proof.x2), 1);
        assert!(ristretto255::point_equals(&sigma_proof.x3, &deserialized_proof.x3), 1);
        assert!(ristretto255::point_equals(&sigma_proof.x4, &deserialized_proof.x4), 1);
        assert!(ristretto255::point_equals(&sigma_proof.x5, &deserialized_proof.x5), 1);
        assert!(ristretto255::point_equals(&sigma_proof.x6, &deserialized_proof.x6), 1);
        assert!(ristretto255::point_equals(&sigma_proof.x7, &deserialized_proof.x7), 1);
        assert!(ristretto255::scalar_equals(&sigma_proof.alpha1, &deserialized_proof.alpha1), 1);
        assert!(ristretto255::scalar_equals(&sigma_proof.alpha2, &deserialized_proof.alpha2), 1);
        assert!(ristretto255::scalar_equals(&sigma_proof.alpha3, &deserialized_proof.alpha3), 1);
        assert!(ristretto255::scalar_equals(&sigma_proof.alpha4, &deserialized_proof.alpha4), 1);
    }
}
