// Minimal test program for deployment verification
program shadow_test.aleo {
    transition hello(public a: u32) -> u32 {
        return a + 1u32;
    }
}
