// Shadow - Privacy-First Anonymous Social & Messaging Platform
// Program: shadow_social.aleo
// Sign in with Aleo. Speak without identity. Transact without exposure.

program shadow_social.aleo {
    
    // ============================================
    // RECORDS - Private data owned by users
    // ============================================
    
    // Shadow Identity - Private identity created from Aleo wallet
    record ShadowIdentity {
        owner: address,           // Wallet owner
        identity_hash: field,     // Unique identity hash (derived from wallet)
        joined_at: u64,           // Block height when joined
        post_count: u32,          // Number of posts created
        is_active: bool,          // Account status
    }
    
    // Shadow Post - Anonymous post record
    record ShadowPost {
        owner: address,           // Post creator (private)
        post_hash: field,         // Hash of post content
        content_hash: field,      // Encrypted content reference
        created_at: u64,          // Block height when posted
        post_id: field,           // Unique post identifier
    }
    
    // Shadow Message - Encrypted P2P message
    record ShadowMessage {
        owner: address,           // Message owner (receiver)
        sender_hash: field,       // Hash of sender (for privacy)
        receiver: address,        // Recipient address
        content_hash: field,      // Encrypted message content hash
        sent_at: u64,             // Block height when sent
        message_id: field,        // Unique message identifier
        is_read: bool,            // Read status
    }
    
    // Payment Record - Private transfer receipt
    record PaymentReceipt {
        owner: address,
        sender_hash: field,
        receiver_hash: field,
        amount: u64,
        memo_hash: field,         // Encrypted memo
        sent_at: u64,
    }
    
    // Uniqueness Token - Anti-spam proof
    record UniquenessToken {
        owner: address,
        token_hash: field,
        valid_until: u64,
        actions_remaining: u8,    // Rate limiting
    }
    
    // ============================================
    // MAPPINGS - Public on-chain state (minimal)
    // ============================================
    
    // Track active identities (identity_hash -> exists)
    mapping identities: field => bool;
    
    // Post existence proofs (post_id -> exists)
    mapping posts: field => bool;
    
    // Rate limiting (identity_hash -> last_post_time)
    mapping rate_limits: field => u64;
    
    // Initialization status (for constructor pattern)
    mapping initialized: u8 => bool;
    
    // ============================================
    // CONSTRUCTOR - One-time initialization
    // ============================================
    
    // Initialize the program (can only be called once)
    transition init() {
        return then finalize();
    }
    
    finalize init() {
        // Check if already initialized
        let is_init: bool = Mapping::get_or_use(initialized, 0u8, false);
        assert(!is_init);
        
        // Mark as initialized
        Mapping::set(initialized, 0u8, true);
    }
    
    // ============================================
    // TRANSITIONS - Core functions
    // ============================================
    
    // Register a new Shadow identity from Aleo wallet
    transition register_identity(
        identity_salt: field,
        current_block: u64
    ) -> ShadowIdentity {
        // Generate unique identity hash from caller + salt
        let identity_hash: field = BHP256::hash_to_field(
            (self.caller, identity_salt)
        );
        
        // Create identity record
        let identity: ShadowIdentity = ShadowIdentity {
            owner: self.caller,
            identity_hash: identity_hash,
            joined_at: current_block,
            post_count: 0u32,
            is_active: true,
        };
        
        return identity then finalize(identity_hash);
    }
    
    finalize register_identity(identity_hash: field) {
        // Ensure identity doesn't already exist
        let exists: bool = Mapping::get_or_use(identities, identity_hash, false);
        assert(!exists);
        
        // Register identity
        Mapping::set(identities, identity_hash, true);
    }
    
    // Create an anonymous post
    transition create_post(
        identity: ShadowIdentity,
        content_hash: field,
        post_salt: field,
        current_block: u64
    ) -> (ShadowIdentity, ShadowPost) {
        // Ensure identity is active
        assert(identity.is_active);
        
        // Generate unique post ID
        let post_id: field = BHP256::hash_to_field(
            (identity.identity_hash, post_salt, current_block)
        );
        
        // Hash the post for public reference
        let post_hash: field = BHP256::hash_to_field(
            (content_hash, current_block)
        );
        
        // Update identity with new post count
        let updated_identity: ShadowIdentity = ShadowIdentity {
            owner: identity.owner,
            identity_hash: identity.identity_hash,
            joined_at: identity.joined_at,
            post_count: identity.post_count + 1u32,
            is_active: identity.is_active,
        };
        
        // Create post record
        let post: ShadowPost = ShadowPost {
            owner: identity.owner,
            post_hash: post_hash,
            content_hash: content_hash,
            created_at: current_block,
            post_id: post_id,
        };
        
        return (updated_identity, post) then finalize(
            identity.identity_hash,
            post_id,
            current_block
        );
    }
    
    finalize create_post(
        identity_hash: field,
        post_id: field,
        current_block: u64
    ) {
        // Check rate limiting (minimum 10 blocks between posts)
        let last_post: u64 = Mapping::get_or_use(rate_limits, identity_hash, 0u64);
        assert(current_block >= last_post + 10u64);
        
        // Register post
        Mapping::set(posts, post_id, true);
        
        // Update rate limit
        Mapping::set(rate_limits, identity_hash, current_block);
    }
    
    // Send a private message
    transition send_message(
        identity: ShadowIdentity,
        receiver: address,
        content_hash: field,
        message_salt: field,
        current_block: u64
    ) -> (ShadowIdentity, ShadowMessage) {
        // Ensure identity is active
        assert(identity.is_active);
        
        // Generate unique message ID
        let message_id: field = BHP256::hash_to_field(
            (identity.identity_hash, receiver, message_salt)
        );
        
        // Create sender hash for privacy
        let sender_hash: field = BHP256::hash_to_field(
            (identity.identity_hash, message_salt)
        );
        
        // Return updated identity (for record management)
        let updated_identity: ShadowIdentity = ShadowIdentity {
            owner: identity.owner,
            identity_hash: identity.identity_hash,
            joined_at: identity.joined_at,
            post_count: identity.post_count,
            is_active: identity.is_active,
        };
        
        // Create message for receiver
        let message: ShadowMessage = ShadowMessage {
            owner: receiver,
            sender_hash: sender_hash,
            receiver: receiver,
            content_hash: content_hash,
            sent_at: current_block,
            message_id: message_id,
            is_read: false,
        };
        
        return (updated_identity, message);
    }
    
    // Mark message as read
    transition read_message(
        message: ShadowMessage
    ) -> ShadowMessage {
        // Only owner can read
        assert_eq(self.caller, message.owner);
        
        // Return updated message
        return ShadowMessage {
            owner: message.owner,
            sender_hash: message.sender_hash,
            receiver: message.receiver,
            content_hash: message.content_hash,
            sent_at: message.sent_at,
            message_id: message.message_id,
            is_read: true,
        };
    }
    
    // Generate anti-spam uniqueness token
    transition prove_uniqueness(
        identity: ShadowIdentity,
        token_salt: field,
        current_block: u64,
        valid_blocks: u64
    ) -> (ShadowIdentity, UniquenessToken) {
        // Ensure identity is active
        assert(identity.is_active);
        
        // Generate token hash
        let token_hash: field = BHP256::hash_to_field(
            (identity.identity_hash, token_salt, current_block)
        );
        
        // Create uniqueness token
        let token: UniquenessToken = UniquenessToken {
            owner: identity.owner,
            token_hash: token_hash,
            valid_until: current_block + valid_blocks,
            actions_remaining: 10u8, // Allow 10 actions per token
        };
        
        return (identity, token);
    }
    
    // Use uniqueness token for action
    transition use_token(
        token: UniquenessToken,
        current_block: u64
    ) -> UniquenessToken {
        // Ensure token is still valid
        assert(current_block <= token.valid_until);
        assert(token.actions_remaining > 0u8);
        
        // Decrement actions
        return UniquenessToken {
            owner: token.owner,
            token_hash: token.token_hash,
            valid_until: token.valid_until,
            actions_remaining: token.actions_remaining - 1u8,
        };
    }
    
    // Private transfer with optional encrypted memo
    transition private_transfer(
        identity: ShadowIdentity,
        receiver: address,
        amount: u64,
        memo_hash: field,
        transfer_salt: field,
        current_block: u64
    ) -> (ShadowIdentity, PaymentReceipt, PaymentReceipt) {
        // Ensure identity is active
        assert(identity.is_active);
        assert(amount > 0u64);
        
        // Create sender hash for privacy
        let sender_hash: field = BHP256::hash_to_field(
            (identity.identity_hash, transfer_salt)
        );
        
        // Create receiver hash for privacy
        let receiver_hash: field = BHP256::hash_to_field(
            (receiver, transfer_salt)
        );
        
        // Sender receipt
        let sender_receipt: PaymentReceipt = PaymentReceipt {
            owner: identity.owner,
            sender_hash: sender_hash,
            receiver_hash: receiver_hash,
            amount: amount,
            memo_hash: memo_hash,
            sent_at: current_block,
        };
        
        // Receiver receipt
        let receiver_receipt: PaymentReceipt = PaymentReceipt {
            owner: receiver,
            sender_hash: sender_hash,
            receiver_hash: receiver_hash,
            amount: amount,
            memo_hash: memo_hash,
            sent_at: current_block,
        };
        
        return (identity, sender_receipt, receiver_receipt);
    }
    
    // Deactivate identity (soft delete)
    transition deactivate_identity(
        identity: ShadowIdentity
    ) -> ShadowIdentity {
        // Only owner can deactivate
        assert_eq(self.caller, identity.owner);
        
        return ShadowIdentity {
            owner: identity.owner,
            identity_hash: identity.identity_hash,
            joined_at: identity.joined_at,
            post_count: identity.post_count,
            is_active: false,
        };
    }
    
    // Reactivate identity
    transition reactivate_identity(
        identity: ShadowIdentity
    ) -> ShadowIdentity {
        // Only owner can reactivate
        assert_eq(self.caller, identity.owner);
        assert(!identity.is_active);
        
        return ShadowIdentity {
            owner: identity.owner,
            identity_hash: identity.identity_hash,
            joined_at: identity.joined_at,
            post_count: identity.post_count,
            is_active: true,
        };
    }
}
