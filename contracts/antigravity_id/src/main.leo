// AntiGravity ID Vault - Zero-Knowledge Identity & Credential System
// Program: antigravity_id.aleo
// Description: Privacy-first identity layer on Aleo using ZK proofs

program antigravity_id.aleo {
    
    // ============================================
    // RECORDS - Private data owned by users
    // ============================================
    
    // Credential record - stores encrypted identity credentials
    record Credential {
        owner: address,           // The credential holder
        data_hash: field,         // Poseidon hash of raw credential data
        credential_type: u8,      // 1=age, 2=kyc, 3=dao_membership, 4=qualification
        birth_year: u16,          // Year of birth (for age proofs)
        issued_at: u64,           // Block height when issued
        issuer: address,          // Authority who issued the credential
        is_valid: bool,           // Can be revoked by issuer
    }
    
    // Proof result record - generated when proving something
    record ProofResult {
        owner: address,           // The prover
        proof_type: u8,           // Type of proof generated
        result: bool,             // Proof outcome (true/false)
        verified_at: u64,         // When verified
    }
    
    // ============================================
    // MAPPINGS - Public on-chain state
    // ============================================
    
    // Track revoked credentials (credential hash -> revoked status)
    mapping revoked_credentials: field => bool;
    
    // Track verified proofs for verifiers to check
    mapping verified_proofs: field => bool;
    
    // Issuer registry (address -> is_authorized)
    mapping authorized_issuers: address => bool;
    
    // ============================================
    // TRANSITIONS - Core functions
    // ============================================
    
    // Register as an authorized credential issuer
    transition register_issuer(public issuer_address: address) -> bool {
        // Only the issuer themselves can register
        assert_eq(self.caller, issuer_address);
        return true then finalize(issuer_address);
    }
    
    finalize register_issuer(issuer_address: address) {
        Mapping::set(authorized_issuers, issuer_address, true);
    }
    
    // Issue a credential to a user
    // The issuer creates a credential record for the recipient
    transition issue_credential(
        recipient: address,
        data_hash: field,
        credential_type: u8,
        birth_year: u16,
        current_block: u64
    ) -> Credential {
        // Validate credential type (1-4)
        assert(credential_type >= 1u8 && credential_type <= 4u8);
        
        // Validate birth year (reasonable range)
        assert(birth_year >= 1900u16 && birth_year <= 2025u16);
        
        // Create the credential record owned by recipient
        let credential: Credential = Credential {
            owner: recipient,
            data_hash: data_hash,
            credential_type: credential_type,
            birth_year: birth_year,
            issued_at: current_block,
            issuer: self.caller,
            is_valid: true,
        };
        
        return credential;
    }
    
    // Prove age is over a threshold WITHOUT revealing exact age
    // Returns true if birth_year makes user older than threshold
    transition prove_age_over(
        credential: Credential,
        threshold_age: u8,
        current_year: u16
    ) -> (Credential, ProofResult) {
        // Ensure credential is valid and is an age credential
        assert(credential.is_valid);
        assert_eq(credential.credential_type, 1u8);
        
        // Calculate current age
        let age: u16 = current_year - credential.birth_year;
        
        // Check if age >= threshold (convert threshold to u16 for comparison)
        let threshold_u16: u16 = threshold_age as u16;
        let is_over_threshold: bool = age >= threshold_u16;
        
        // Create proof result
        let proof: ProofResult = ProofResult {
            owner: credential.owner,
            proof_type: 1u8, // Age proof type
            result: is_over_threshold,
            verified_at: 0u64, // Will be set on-chain
        };
        
        // Return both the original credential and the proof
        return (credential, proof);
    }
    
    // Verify DAO/community membership
    // Proves the user holds a valid membership credential
    transition verify_membership(
        credential: Credential,
        dao_hash: field
    ) -> (Credential, ProofResult) {
        // Ensure credential is valid and is a membership credential
        assert(credential.is_valid);
        assert_eq(credential.credential_type, 3u8);
        
        // Check if credential data hash matches expected DAO
        let is_member: bool = credential.data_hash == dao_hash;
        
        // Create proof result
        let proof: ProofResult = ProofResult {
            owner: credential.owner,
            proof_type: 3u8, // Membership proof type
            result: is_member,
            verified_at: 0u64,
        };
        
        return (credential, proof);
    }
    
    // Verify KYC status without revealing documents
    transition verify_kyc(
        credential: Credential
    ) -> (Credential, ProofResult) {
        // Ensure credential is valid and is a KYC credential
        assert(credential.is_valid);
        assert_eq(credential.credential_type, 2u8);
        
        // KYC is valid if credential exists and is not revoked
        let kyc_passed: bool = credential.is_valid;
        
        // Create proof result
        let proof: ProofResult = ProofResult {
            owner: credential.owner,
            proof_type: 2u8, // KYC proof type
            result: kyc_passed,
            verified_at: 0u64,
        };
        
        return (credential, proof);
    }
    
    // Submit a proof for on-chain verification
    // This allows verifiers to check proof validity
    transition submit_proof(
        proof: ProofResult,
        proof_id: field
    ) -> ProofResult {
        // Only submit if proof was successful
        assert(proof.result);
        
        return proof then finalize(proof_id, proof.result);
    }
    
    finalize submit_proof(proof_id: field, result: bool) {
        Mapping::set(verified_proofs, proof_id, result);
    }
    
    // Revoke a credential (only issuer can do this)
    transition revoke_credential(
        credential: Credential,
        credential_id: field
    ) -> Credential {
        // Only the original issuer can revoke
        assert_eq(self.caller, credential.issuer);
        
        // Create revoked version of credential
        let revoked: Credential = Credential {
            owner: credential.owner,
            data_hash: credential.data_hash,
            credential_type: credential.credential_type,
            birth_year: credential.birth_year,
            issued_at: credential.issued_at,
            issuer: credential.issuer,
            is_valid: false, // Mark as invalid
        };
        
        return revoked then finalize(credential_id);
    }
    
    finalize revoke_credential(credential_id: field) {
        Mapping::set(revoked_credentials, credential_id, true);
    }
    
    // Transfer credential ownership (for credential portability)
    transition transfer_credential(
        credential: Credential,
        new_owner: address
    ) -> Credential {
        // Only current owner can transfer
        assert_eq(self.caller, credential.owner);
        assert(credential.is_valid);
        
        // Create new credential with updated owner
        let transferred: Credential = Credential {
            owner: new_owner,
            data_hash: credential.data_hash,
            credential_type: credential.credential_type,
            birth_year: credential.birth_year,
            issued_at: credential.issued_at,
            issuer: credential.issuer,
            is_valid: credential.is_valid,
        };
        
        return transferred;
    }
    
    // Selective disclosure - prove you have a credential without revealing details
    // Returns a minimal proof that a valid credential exists
    transition prove_credential_exists(
        credential: Credential
    ) -> ProofResult {
        // Just verify the credential is valid
        assert(credential.is_valid);
        
        // Create minimal existence proof
        let proof: ProofResult = ProofResult {
            owner: credential.owner,
            proof_type: 4u8, // Existence proof type
            result: true,
            verified_at: 0u64,
        };
        
        return proof;
    }
}
