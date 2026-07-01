#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, symbol_short};

#[contract]
pub struct AngpaoSubsDappContract;

#[contractimpl]
impl AngpaoSubsDappContract {
    pub fn lock(_env: Env) -> Symbol { symbol_short!("locked") }
    pub fn release(_env: Env) -> Symbol { symbol_short!("released") }
    pub fn refund(_env: Env) -> Symbol { symbol_short!("refunded") }
}
