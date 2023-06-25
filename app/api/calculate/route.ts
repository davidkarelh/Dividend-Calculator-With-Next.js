import { CalculateRequestBody } from "@/structs/CalculateRequestBody";
import { CalculateResponseElement } from "@/structs/CalculateResponseElement";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
    return NextResponse.json({ message: `success` });
}

const futureValue = (rate: number, nper: number, presentValue: number) => {
    return presentValue * Math.pow(1 + rate, nper);
}

export async function POST(request: NextRequest) {
    const reqBody = await request.json() as CalculateRequestBody;
    const resArray: CalculateResponseElement[] = [];

    for (let i = 0; i < reqBody.yearsInvested; i++) {
        const year = i + 1;
        const principal = i == 0 ? (reqBody.sharePrice * reqBody.numberOfShares) : resArray[i - 1].finalValue;
        const expectedAnnualDividendAmountIncreasePercentage = reqBody.expectedAnnualDividendAmountIncreasePercentage / 100.0;
        const dividendYieldPercentage = i == 0 ? (reqBody.annualDividendYield / 100.0) : resArray[i - 1].dividendYieldPercentage * (1 + expectedAnnualDividendAmountIncreasePercentage);
        const dividendTaxRate = reqBody.dividendTaxRate / 100.0;
        const expectedAnnualSharePriceAppreciationpercentage = reqBody.expectedAnnualSharePriceAppreciationpercentage / 100.0;
        const annualDividend = Math.round(principal * (Math.pow(1 + (dividendYieldPercentage / reqBody.dividendDistributionPeriod), reqBody.dividendDistributionPeriod) - 1) * 1000000) / 1000000;
        const afterReinvestmentValue = 
            reqBody.dividendReinvestmentPlan ?
                ((futureValue(dividendYieldPercentage / reqBody.dividendDistributionPeriod, reqBody.dividendDistributionPeriod, principal) - principal) * (1 - (reqBody.taxableAccount ? dividendTaxRate : 0)) + principal)
            :
                principal
            ;
            
        const principalIncrease = principal * expectedAnnualSharePriceAppreciationpercentage;
        const annualContribution = reqBody.annualContribution;
        const finalValue = afterReinvestmentValue + principalIncrease + annualContribution;
        const cumulativeDividends = annualDividend + (i == 0 ? 0 : resArray[i - 1].cumulativeDividends);
        const totalContributions = annualContribution + (i == 0 ? principal : resArray[i - 1].totalContributions);

        resArray.push({
            year,
            principal,
            annualDividend,
            dividendYieldPercentage,
            afterReinvestmentValue,
            principalIncrease,
            annualContribution,
            finalValue,
            cumulativeDividends,
            totalContributions
        });
    }

    return NextResponse.json({
        message: `Dividend calculated successfully`,
        data: resArray
    });
}