package xyz.northveil.mobile.core.network

import retrofit2.Response
import retrofit2.http.*
import xyz.northveil.mobile.core.network.dto.*

interface NorthveilApiService {

    @POST("api/v1/tools/create_wallet")
    suspend fun createWallet(
        @Body request: CreateWalletRequest
    ): Response<WalletResponse>

    @GET("api/balances/{address}")
    suspend fun getMultiChainBalances(
        @Path("address") address: String,
        @Query("includeTestnets") includeTestnets: Boolean = true
    ): Response<BalancesDto>

    @POST("api/gas/estimate")
    suspend fun estimateGas(
        @Body request: GasEstimateRequest
    ): Response<GasEstimateResponse>

    @POST("api/transactions/transfer")
    suspend fun executeTransfer(
        @Header("X-API-Key") apiKey: String?,
        @Body request: TransferRequestDto
    ): Response<TransactionResultDto>

    @GET("api/approvals/{walletAddress}")
    suspend fun fetchApprovals(
        @Path("walletAddress") walletAddress: String
    ): Response<List<ApprovalRecordDto>>

    @POST("api/approvals/{id}/decision")
    suspend fun submitApprovalDecision(
        @Path("id") id: String,
        @Body decision: ApprovalDecisionDto
    ): Response<Unit>
}
