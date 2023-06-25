'use client'

import React, { useEffect, useState } from "react";
import { select, scaleLinear, axisBottom, axisLeft, line, curveMonotoneX } from 'd3';
import LoadingOverlay from 'react-loading-overlay-ts';
import { CalculateResponseElement } from "@/structs/CalculateResponseElement";
import { DividendTableRow } from "@/components/DividendTableRow";


export default function Home() {
  const [sharePrice, setSharePrice] = useState(0);
  const [numberOfShares, setNumberOfShares] = useState(0);
  const [annualDividendYield, setAnnualDividendYield] = useState(0);
  const [dividendTaxRate, setDividendTaxRate] = useState(0);
  const [expectedAnnualDividendAmountIncreasePercentage, setExpectedAnnualDividendAmountIncreasePercentage] = useState(0);
  const [dividendDistributionPeriod, setDividendDistributionPeriod] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(0);
  const [expectedAnnualSharePriceAppreciationpercentage, setExpectedAnnualSharePriceAppreciationpercentage] = useState(0);
  const [yearsInvested, setYearsInvested] = useState(0);
  const [taxableAccount, setTaxableAccount] = useState(false);
  const [dividendReinvestmentPlan, setDividendReinvestmentPlan] = useState(false);
  const [tableData, setTableData] = useState<CalculateResponseElement[]>([]);
  const [resultHidden, setResultHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatNumberString = (str: string) => {
    const num = parseFloat(str);
    let numString = num.toLocaleString(`id-ID`);

    if (numString.length >= 3 && numString.indexOf(`,`) == numString.length - 2) {
      numString += `0`;
    }
    return {num, numString};
  }

  const submitToCalculate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResultHidden(true);
    const fetchResponse = await fetch(`/api/calculate`, {
      method: `POST`,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ 
        sharePrice,
        numberOfShares,
        annualDividendYield,
        dividendTaxRate,
        expectedAnnualDividendAmountIncreasePercentage,
        dividendDistributionPeriod,
        annualContribution,
        expectedAnnualSharePriceAppreciationpercentage,
        yearsInvested,
        taxableAccount,
        dividendReinvestmentPlan
       })
    });

    const response = await fetchResponse.json();
    const tableDataFetched = response.data as CalculateResponseElement[];
    setTableData(tableDataFetched);
  };

  useEffect(() => {
    // Draw the line chart svg
    if (tableData.length > 0) {
      const dataset = tableData.map((elem) => {
        return [elem.year, elem.principal];
      });
  
      var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
      var container = select('#svg-container');
  
      container.select('svg').remove();
  
      var svg = container.append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  
      const minX = dataset.reduce((prev, curr) => {
        return prev[0] < curr[0] ? prev : curr;
      })[0];
  
      const maxX = dataset.reduce((prev, curr) => {
        return prev[0] > curr[0] ? prev : curr;
      })[0];
  
      const minY = dataset.reduce((prev, curr) => {
        return prev[1] < curr[1] ? prev : curr;
      })[1];
  
      const maxY = dataset.reduce((prev, curr) => {
        return prev[1] > curr[1] ? prev : curr;
      })[1];
  
      const xScale = scaleLinear().domain([Math.floor(minX), Math.ceil(maxX)]).range([0, width - 40]),
        yScale = scaleLinear().domain([Math.floor(minY), Math.ceil(maxY)]).range([height, 0]);
  
      svg.append("g")
           .attr("transform", "translate(" + 40 + "," + height + ")")
           .call(axisBottom(xScale));
           
      svg.append("g")
        .attr("transform", `translate(${40},0)`)
        .call(axisLeft(yScale));
  
      svg.append('g')
        .selectAll("dot")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d[0]); } )
        .attr("cy", function (d) { return yScale(d[1]); } )
        .attr("r", 2)
        .attr("transform", "translate(" + 40 + "," + 0 + ")")
        .style("fill", "#CC0000");
  
      const line_generator = line<any>()
        .x(function(d) { return xScale(d[0]); }) 
        .y(function(d) { return yScale(d[1]); }) 
        .curve(curveMonotoneX)
  
      svg.append("path")
        .datum(dataset) 
        .attr("class", "line") 
        .attr("transform", "translate(" + 40 + "," + 0 + ")")
        .attr("d", line_generator)
        .style("fill", "none")
        .style("stroke", "#CC0000")
        .style("stroke-width", "2");
      setResultHidden(false);
    }
    setLoading(false);
  }, [tableData]);

  useEffect(() => {
    if (loading == false) {
      const resultElement = document.getElementById("svg-container");
      resultElement?.scrollIntoView({
        behavior: `smooth`
      });
    }

  }, [loading]);

  return (
    <div>
      <LoadingOverlay
        active={loading}
        spinner
        text='Calculating...'
      >
        <div className="min-h-screen p-4 bg-slate-800 flex items-center justify-center">
        <div className="container max-w-screen-lg mx-auto">
            <h2 className="font-semibold text-xl text-gray-400 mb-6">Dividend Calculator</h2>
            <form className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6" onSubmit={submitToCalculate}>
                <div className="text-black grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label htmlFor="share_price" className="text-xs">Share Price</label>
                      <div className="w-full border ps-2 rounded bg-gray-50">Rp<input required={true} type="text" name="share_price" id="share_price" className="h-10 mt-1 px-2 bg-gray-50" placeholder='10.000' 
                        onChange={(e) => {
                          if (e.target.value[e.target.value.length - 1] >= `0` && e.target.value[e.target.value.length - 1] <= `9`) {
                            const { num, numString } = formatNumberString(e.target.value.replaceAll(`.`, ``));
                            e.target.value = numString;
                            setSharePrice(num);
                          } else {
                            e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                          }
                        }}
                      />,00</div>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="number_of_shares" className="text-xs">Number of Shares</label>
                      <input required={true} type="number" min={1} name="number_of_shares" id="number_of_shares" className="h-10 border mt-1 rounded px-4 bg-gray-50 w-full" placeholder="10000"
                        onChange={(e) => {
                          setNumberOfShares(parseInt(e.target.value));
                        }}
                      />
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="annual_dividend_yield" className="text-xs">Annual Dividend Yield</label>
                      <div className="w-full border ps-2 rounded bg-gray-50"><input required={true} type="number" name="annual_dividend_yield" id="annual_dividend_yield" min={0.001} step={0.001} max={100} className="h-10 mt-1 rounded px-4 bg-gray-50" placeholder='5' 
                        onChange={(e) => {
                          setAnnualDividendYield(parseFloat(e.target.value));
                        }}
                      /> %</div>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="dividend_tax_rate" className="text-xs">Dividend Tax Rate</label>
                      <div className="w-full border ps-2 rounded bg-gray-50"><input required={true} type="number" name="dividend_tax_rate" id="dividend_tax_rate" min={0.001} step={0.001} max={100} className="h-10 mt-1 rounded px-4 bg-gray-50" placeholder='10' 
                        onChange={(e) => {
                          setDividendTaxRate(parseFloat(e.target.value));
                        }}
                      /> %</div>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="expected_annual_dividend_amount_increase_%" className="text-xs">Expected Annual Dividend Amount Increase %</label>
                      <div className="w-full border ps-2 rounded bg-gray-50"><input required={true} type="number" name="expected_annual_dividend_amount_increase_%" id="expected_annual_dividend_amount_increase_%" min={0.001} step={0.001} max={100} className="h-10 mt-1 rounded px-4 bg-gray-50" placeholder='1' 
                        onChange={(e) => {
                          setExpectedAnnualDividendAmountIncreasePercentage(parseFloat(e.target.value));
                        }}
                      /> % (per year)</div>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="dividend_distribution_period" className="text-xs">Dividend Distribution Period (per year)</label>
                      <input required={true} type="number" name="dividend_distribution_period" id="dividend_distribution_period" min={1} max={12} className="h-10 border mt-1 rounded px-4 bg-gray-50 w-full" placeholder='1'
                        onChange={(e) => {
                          setDividendDistributionPeriod(parseInt(e.target.value));
                        }}
                      />
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="annual_contribution" className="text-xs">Annual Contribution</label>
                      <div className="w-full border ps-2 rounded bg-gray-50">Rp<input required={true} type="text" name="annual_contribution" id="annual_contribution" className="h-10 mt-1 px-2 bg-gray-50" placeholder='12.000.000' 
                        onChange={(e) => {
                          if (e.target.value[e.target.value.length - 1] >= `0` && e.target.value[e.target.value.length - 1] <= `9`) {
                            const { num, numString } = formatNumberString(e.target.value.replaceAll(`.`, ``));
                            e.target.value = numString;
                            setAnnualContribution(num);
                          } else {
                            e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                          }
                        }}
                      />,00</div>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="expected_annual_share_price_appreciation_%" className="text-xs">Expected Annual Share Price Appreciation %</label>
                      <div className="w-full border ps-2 rounded bg-gray-50"><input required={true} type="number" name="expected_annual_share_price_appreciation_%" id="expected_annual_share_price_appreciation_%" min={0.001} step={0.001} max={100} className="h-10 mt-1 rounded px-4 bg-gray-50" placeholder='3'
                        onChange={(e) => {
                          setExpectedAnnualSharePriceAppreciationpercentage(parseFloat(e.target.value));
                        }}
                      /> %  (per year)</div>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="years_invested" className="text-xs">Years Invested</label>
                      <input required={true} type="number" name="years_invested" id="years_invested" min={1} className="h-10 border mt-1 rounded px-4 bg-gray-50 w-full" placeholder='10' 
                        onChange={(e) => {
                          setYearsInvested(parseInt(e.target.value));
                        }}
                      />
                    </div>

                    <div className="col-span-full">
                      <div className="inline-flex items-center">
                        <input type="checkbox" name="taxable_account" id="taxable_account" className="form-checkbox"
                          onChange={(e) => {
                            setTaxableAccount(e.target.checked)
                          }}
                        />
                        <label htmlFor="taxable_account" className="ml-2">Taxable Account</label>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <div className="inline-flex items-center">
                        <input type="checkbox" name="drip" id="drip" className="form-checkbox" 
                          onChange={(e) => {
                            setDividendReinvestmentPlan(e.target.checked);
                          }}
                        />
                        <label htmlFor="drip" className="ml-2">Dividend Reinvestment Plan</label>
                      </div>
                    </div>
            
                    <div className="col-span-3 text-right">
                      <div className="inline-flex items-end">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Calculate</button>
                      </div>
                    </div>

                </div>
            </form>  
        </div>
      </div>

      <div id="result" hidden={resultHidden}>
        <div className="min-h-screen bg-slate-800 flex items-center justify-center">
          <div className="flex flex-col antialiased bg-slate-800 text-gray-600 min-h-screen px-4">
            <h2 className="font-semibold text-xl text-gray-400 mb-6">Results</h2>
            <div className="w-full max-w-screen-lg mx-auto bg-white shadow-lg rounded-sm border border-gray-200 p-2">
                <header className="px-5\ py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Chart</h2>
                </header>
                <div id="svg-container">
                  <svg id="svg"></svg>
                </div>
            </div>
          </div>
        </div>

        <div className="min-h-screen bg-slate-800 flex items-center justify-center">
          <section className="flex flex-col antialiased bg-slate-800 text-gray-600 min-h-screen px-4">
                <div className="h-full rounded">
                    <div className="w-full max-w-screen-lg mx-auto bg-white shadow-lg rounded-sm border border-gray-200 p-2">
                        <header className="px-5\ py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">Table</h2>
                        </header>
                        <div className="p-3">
                            <div className="overflow-x-auto overflow-y-auto">
                                <table className="table-auto w-full">
                                    <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                                        <tr className="text-black">
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-left">Year</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-left">Principal</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-left">Annual Dividend</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Dividend Yield Percentage</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-left">After Reinvestment Value</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-left">Principal Increase</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-left">Annual Contribution</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Final Value</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Cumulative Dividends</div>
                                            </th>
                                            <th className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Total Contributions</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-100">
                                      {tableData.map((data) => {
                                          return (
                                              <DividendTableRow data={data} key={data.year}/>
                                          )
                                      })}
                                    </tbody>
                                </table>
                            </div>
                            {tableData.length == 0 && <div>Calculate to show data</div>}
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
      </LoadingOverlay>
    </div>
  )
}
