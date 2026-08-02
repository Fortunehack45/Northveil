export class BitcoinService {
  private static MEMPOOL_API = 'https://mempool.space/api';

  /**
   * Fetches the Bitcoin balance for a given address using the mempool.space API.
   * Calculates the total balance from both confirmed (chain_stats) and unconfirmed (mempool_stats) UTXOs.
   * Returns balance in BTC (not satoshis).
   */
  static async fetchBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.MEMPOOL_API}/address/${address}`);
      if (!response.ok) {
        throw new Error(`Mempool API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const chainStats = data.chain_stats || { funded_txo_sum: 0, spent_txo_sum: 0 };
      const mempoolStats = data.mempool_stats || { funded_txo_sum: 0, spent_txo_sum: 0 };

      const confirmedBalance = chainStats.funded_txo_sum - chainStats.spent_txo_sum;
      const unconfirmedBalance = mempoolStats.funded_txo_sum - mempoolStats.spent_txo_sum;

      const totalSatoshis = confirmedBalance + unconfirmedBalance;
      
      // Convert satoshis to BTC
      return totalSatoshis / 100_000_000;
    } catch (e) {
      console.error(`Failed to fetch Bitcoin balance for ${address}:`, e);
      return 0; // Fallback to 0 on error
    }
  }

  /**
   * Fetches the recommended Bitcoin network fees (in sat/vB).
   */
  static async fetchRecommendedFees(): Promise<{ fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number }> {
    try {
      const response = await fetch(`${this.MEMPOOL_API}/v1/fees/recommended`);
      if (!response.ok) {
        throw new Error(`Mempool API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch recommended Bitcoin fees:', e);
      return {
        fastestFee: 20,
        halfHourFee: 15,
        hourFee: 10,
        economyFee: 5,
        minimumFee: 1
      };
    }
  }
}
