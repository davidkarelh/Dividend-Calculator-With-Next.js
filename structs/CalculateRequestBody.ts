export interface CalculateRequestBody {
    sharePrice: number,
    numberOfShares: number,
    annualDividendYield: number,
    dividendTaxRate: number,
    expectedAnnualDividendAmountIncreasePercentage: number,
    dividendDistributionPeriod: number,
    annualContribution: number,
    expectedAnnualSharePriceAppreciationpercentage: number,
    yearsInvested: number,
    taxableAccount: boolean,
    dividendReinvestmentPlan: boolean
}