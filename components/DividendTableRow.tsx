"use client"

import { CalculateResponseElement } from "@/structs/CalculateResponseElement"

type DividendTableRowProps = {
    data: CalculateResponseElement
}
  
export function DividendTableRow({ data }: DividendTableRowProps) {
    const formatNumberStringWith2DecimalDigitForced = (str: string) => {
        const num = parseFloat(str);
        let numString = num.toLocaleString(`id-ID`);
    
        if (numString.length >= 3 && numString.indexOf(`,`) == numString.length - 2) {
          numString += `0`;
        }
    
        if (!numString.includes(`,`)) {
        numString += `,00`;
        }
    
        return {num, numString};
      }

    return (
        <tr className="text-black">
            <td className="p-2 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="font-medium text-gray-800">{data.year}</div>
                </div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.principal.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.annualDividend.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-center font-large text-green-500">{Math.round(data.dividendYieldPercentage * 100 * 100) / 100}%</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.afterReinvestmentValue.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.principalIncrease.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.annualContribution.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.finalValue.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.cumulativeDividends.toFixed(2)).numString}</div>
            </td>
            <td className="p-2 whitespace-nowrap">
                <div className="text-left font-medium text-green-500">Rp{formatNumberStringWith2DecimalDigitForced(data.totalContributions.toFixed(2)).numString}</div>
            </td>
        </tr>
    )
  }