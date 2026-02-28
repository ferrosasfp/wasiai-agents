/**
 * Viem public client for Avalanche Fuji Testnet (or mainnet via RPC_URL)
 */
import { createPublicClient, http } from 'viem'
import { avalancheFuji } from 'viem/chains'

let _client: ReturnType<typeof createPublicClient> | null = null

export function getPublicClient() {
  if (_client) return _client
  const rpcUrl = process.env.RPC_URL ?? 'https://api.avax-test.network/ext/bc/C/rpc'
  _client = createPublicClient({
    chain: avalancheFuji,
    transport: http(rpcUrl),
  })
  return _client
}
