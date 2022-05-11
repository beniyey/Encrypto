
///  <reference path="jquery-3.6.0.js"/>


$(function () {

    // getting all data about our coins from the server 
    dataFetchFromGecko = async () => {
        try {
            const coinData = await fetch("https://api.coingecko.com/api/v3/coins");
            const allCoinsArr = await coinData.json()
            // sending all of our coins to ls for later use 
            localStorage.setItem("list of coins", JSON.stringify(allCoinsArr))
        } catch (err) {
            console.log(err)
        }
    }
    dataFetchFromGecko()

    function coinsAndGraph(card) {
        $("#coinsAndGraph").empty()
        const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins"))
        const allCoinsArr = JSON.parse(localStorage.getItem("list of coins"))
        if (card == "all") {
            for (const coin of allCoinsArr) {
                const card =
                    `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
        <div class="coin-element">
            <img src="${coin.image.thumb}" class="thumb-image " alt="...">
        </div>

        <div class="coin-element">
            <h5 class="card-title">${coin.id}</h5>
        </div>

        <div style="margin:0% auto;" class="form-check form-switch">
            <input style="margin:10% 25%;" class="form-check-input" onclick="chooseMonitoredCoin(${coin.symbol})"
                type="checkbox" role="switch" id="${coin.symbol}">
        </div>
        <div style="margin:20% auto;" hidden id="buttonForMore${coin.symbol}Div"
            class="animate__animated animate__fadeInDown">
            <div class="coin-element">

                <div class="coin-element">
                    <h5 class="card-title"> Current price</h5>
                </div>

                <div class="coin-element">
                    <h5 class="card-element">$ ${coin.market_data.current_price.usd}</h5>
                </div>

                <div class="coin-element">
                    <h5 class="card-element">€ ${coin.market_data.current_price.eur}</h5>
                </div>

                <div class="coin-element">
                    <h5 class="card-element">₪ ${coin.market_data.current_price.ils}</h5>
                </div>

            </div>
        </div>
        <div class="coin-element">
            <button id="buttonForMore${coin.symbol}" class=" btn btn-primary">More info.</button>
        </div>

`

                $("#coinsAndGraph").append(card)
            }
        }
        if (card == "chosen") {
            chosenCoinArr.forEach(element => {
                const coin = allCoinsArr.find(coin => coin.symbol == element)
                const card =
                    `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
                    <div class="coin-element">
                        <img src="${coin.image.thumb}" class="thumb-image " alt="...">
                    </div>
            
                    <div class="coin-element">
                        <h5 class="card-title">${coin.id}</h5>
                    </div>
            
                    <div style="margin:0% auto;" class="form-check form-switch">
                        <input style="margin:10% 25%;" class="form-check-input" onclick="chooseMonitoredCoin(${coin.symbol})"
                            type="checkbox" role="switch" id="${coin.symbol}">
                    </div>
        
        
                    <!-- Hidden card which becomes visible when you click on more info  -->
        
                    <div style="margin:20% auto;" hidden id="buttonForMore${coin.symbol}Div"
                        class="animate__animated animate__fadeInDown">
                        <div class="coin-element">
            
                            <div class="coin-element">
                                <h5 class="card-title"> Current price</h5>
                            </div>
            
                            <div class="coin-element">
                                <h5 class="card-element">$ ${coin.market_data.current_price.usd}</h5>
                            </div>
            
                            <div class="coin-element">
                                <h5 class="card-element">€ ${coin.market_data.current_price.eur}</h5>
                            </div>
            
                            <div class="coin-element">
                                <h5 class="card-element">₪ ${coin.market_data.current_price.ils}</h5>
                            </div>
            
                        </div>
                    </div>
                    <div class="coin-element">
                        <button id="buttonForMore${coin.symbol}" class=" btn btn-primary">More info.</button>
                    </div>
            
        `
                $("#coinsAndGraph").append(card)
            })
        }
        if (card == "live") {
                let graphDataPoints = []


                chosenCoinArr.forEach(async (element) => {

                    const coin = allCoinsArr.find(coin => coin.symbol == element)
                    const priceData = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=USD&days=10&interval=daily`)
                    const coinPrice = await priceData.json()
                    graphDataPoints.push({
                        type: "spline",
                        name: `${coin.id}`,
                        showInLegend: true,
                        xValueFormatString: ``,
                        yValueFormatString: "#,##0 $",
                        dataPoints: []
                    })
                    let day = new Date().getDate() - 10
                    coinPrice.prices.forEach((elementPrice) => {
                        day != new Date().getDate() ? day += 1 : null;
                        const one = graphDataPoints.find(el => el.name == coin.id)
                        one.dataPoints.push({ x: day, y: elementPrice[1] })
                    })
                    let graph = function () {

                        var chart = new CanvasJS.Chart("chartContainer", {
                            animationEnabled: true,
                            zoomEnabled: true,
                            theme: "dark2",
                            title: {
                                text: "Price for 10 days"
                            },
                            axisX: {
                                title: "Year",
                                valueFormatString: "####",
                                interval: 2
                            },
                            axisY: {
                                logarithmic: true, //change it to false
                                title: "price in USD (Log)",
                                prefix: "$",
                                titleFontColor: "#6D78AD",
                                lineColor: "#6D78AD",
                                gridThickness: 0,
                                lineThickness: 1,
                                labelFormatter: addSymbols
                            },
                            axisY2: {
                                title: "Profit in USD",
                                prefix: "$",
                                titleFontColor: "#51CDA0",
                                logarithmic: false, //change it to true
                                lineColor: "#51CDA0",
                                gridThickness: 0,
                                lineThickness: 1,
                                labelFormatter: addSymbols
                            },
                            legend: {
                                verticalAlign: "top",
                                fontSize: 16,
                                dockInsidePlotArea: true
                            },
                            data: graphDataPoints
                        });
                        chart.render();

                        function addSymbols(e) {
                            var suffixes = ["", "K", "M", "B"];

                            var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
                            if (order > suffixes.length - 1)
                                order = suffixes.length - 1;

                            var suffix = suffixes[order];
                            return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
                        }

                    }
                    $("#coinsAndGraph").append(`<div id="chartContainer" hidden style=" margin: 5% auto; height: auto; width: 80%;"></div>`)
                    $("#coinsAndGraph").append(graph)
                    $("#chartContainer").removeAttr("hidden")
                })




        }

        checkToggle()
        $("button").on("click", function () {
            $(`#${this.id}ParentDiv`).toggleClass("coin-div-more")
            $(this).html() == "More info." ? $(this).html("less") : ($(this).html() == "less" ? $(this).html("More info.") : null);
    
            $(`#${this.id}Div`).attr("hidden") == undefined ? $(`#${this.id}Div`).attr("hidden", "hidden") : $(`#${this.id}Div`).removeAttr("hidden");
        })
    }
    coinsAndGraph("chosen")
    $("#allCoins").on("click", () => coinsAndGraph("all"))
    $("#myCoins").on("click", () => {coinsAndGraph("chosen")})
    $("#liveReports").on("click", () => {coinsAndGraph("live")})
    // prints all coins
    //     $("#allCoins").on("click", () => {
    //         $("#coinsAndGraph").empty()
    //         const allCoinsArr = JSON.parse(localStorage.getItem("list of coins"))
    //         for (const coin of allCoinsArr) {
    //             const card =
    //                 `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
    //             <div class="coin-element">
    //                 <img src="${coin.image.thumb}" class="thumb-image " alt="...">
    //             </div>

    //             <div class="coin-element">
    //                 <h5 class="card-title">${coin.id}</h5>
    //             </div>

    //             <div style="margin:0% auto;" class="form-check form-switch">
    //                 <input style="margin:10% 25%;" class="form-check-input" onclick="chooseMonitoredCoin(${coin.symbol})"
    //                     type="checkbox" role="switch" id="${coin.symbol}">
    //             </div>
    //             <div style="margin:20% auto;" hidden id="buttonForMore${coin.symbol}Div"
    //                 class="animate__animated animate__fadeInDown">
    //                 <div class="coin-element">

    //                     <div class="coin-element">
    //                         <h5 class="card-title"> Current price</h5>
    //                     </div>

    //                     <div class="coin-element">
    //                         <h5 class="card-element">$ ${coin.market_data.current_price.usd}</h5>
    //                     </div>

    //                     <div class="coin-element">
    //                         <h5 class="card-element">€ ${coin.market_data.current_price.eur}</h5>
    //                     </div>

    //                     <div class="coin-element">
    //                         <h5 class="card-element">₪ ${coin.market_data.current_price.ils}</h5>
    //                     </div>

    //                 </div>
    //             </div>
    //             <div class="coin-element">
    //                 <button id="buttonForMore${coin.symbol}" class=" btn btn-primary">More info.</button>
    //             </div>

    // `

    //             $("#coinsAndGraph").append(card)
    //         }
    //         $("button").on("click", function () {
    //             $(`#${this.id}ParentDiv`).toggleClass("coin-div-more")
    //             $(this).html() == "More info." ? $(this).html("less") : ($(this).html() == "less" ? $(this).html("More info.") : null);

    //             $(`#${this.id}Div`).attr("hidden") == undefined ? $(`#${this.id}Div`).attr("hidden", "hidden") : $(`#${this.id}Div`).removeAttr("hidden");
    //         })
    //         checkToggle()
    //     })

    // prints chosen coins 
    //     $("#myCoins").on("click", () => {
    //         const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins"))
    //         const allCoinsArr = JSON.parse(localStorage.getItem("list of coins"))
    //         $("#coinsAndGraph").empty()
    //         chosenCoinArr.forEach(element => {
    //             const coin = allCoinsArr.find(coin => coin.symbol == element)
    //             const card =

    //                 // ------- visible card
    //                 `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
    //             <div class="coin-element">
    //                 <img src="${coin.image.thumb}" class="thumb-image " alt="...">
    //             </div>

    //             <div class="coin-element">
    //                 <h5 class="card-title">${coin.id}</h5>
    //             </div>

    //             <div style="margin:0% auto;" class="form-check form-switch">
    //                 <input style="margin:10% 25%;" class="form-check-input" onclick="chooseMonitoredCoin(${coin.symbol})"
    //                     type="checkbox" role="switch" id="${coin.symbol}">
    //             </div>


    //             <!-- Hidden card which becomes visible when you click on more info  -->

    //             <div style="margin:20% auto;" hidden id="buttonForMore${coin.symbol}Div"
    //                 class="animate__animated animate__fadeInDown">
    //                 <div class="coin-element">

    //                     <div class="coin-element">
    //                         <h5 class="card-title"> Current price</h5>
    //                     </div>

    //                     <div class="coin-element">
    //                         <h5 class="card-element">$ ${coin.market_data.current_price.usd}</h5>
    //                     </div>

    //                     <div class="coin-element">
    //                         <h5 class="card-element">€ ${coin.market_data.current_price.eur}</h5>
    //                     </div>

    //                     <div class="coin-element">
    //                         <h5 class="card-element">₪ ${coin.market_data.current_price.ils}</h5>
    //                     </div>

    //                 </div>
    //             </div>
    //             <div class="coin-element">
    //                 <button id="buttonForMore${coin.symbol}" class=" btn btn-primary">More info.</button>
    //             </div>

    // `
    //             $("#coinsAndGraph").append(card)
    //         })
    //         $("button").on("click", function () {
    //             $(`#${this.id}ParentDiv`).toggleClass("coin-div-more")
    //             $(this).html() == "More info." ? $(this).html("less") : ($(this).html() == "less" ? $(this).html("More info.") : null);

    //             $(`#${this.id}Div`).attr("hidden") == undefined ? $(`#${this.id}Div`).attr("hidden", "hidden") : $(`#${this.id}Div`).removeAttr("hidden");
    //         })
    //         checkToggle()
    //     })

    // prints our graph
    // $("#liveReports").on("click", () => {
    //     const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins"))
    //     const allCoinsArr = JSON.parse(localStorage.getItem("list of coins"))
    //     let graphDataPoints = []
    //     $("#coinsAndGraph").empty()

    //     chosenCoinArr.forEach(async (element) => {

    //         const coin = allCoinsArr.find(coin => coin.symbol == element)
    //         const priceData = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=USD&days=10&interval=daily`)
    //         const coinPrice = await priceData.json()
    //         graphDataPoints.push({
    //             type: "spline",
    //             name: `${coin.id}`,
    //             showInLegend: true,
    //             xValueFormatString: ``,
    //             yValueFormatString: "#,##0 $",
    //             dataPoints: []
    //         })
    //         let day = new Date().getDate() - 10
    //         coinPrice.prices.forEach((elementPrice) => {
    //             day != new Date().getDate() ? day += 1 : null;
    //             const one = graphDataPoints.find(el => el.name == coin.id)
    //             one.dataPoints.push({ x: day, y: elementPrice[1] })
    //         })
    //         let graph = function () {

    //             var chart = new CanvasJS.Chart("chartContainer", {
    //                 animationEnabled: true,
    //                 zoomEnabled: true,
    //                 theme: "dark2",
    //                 title: {
    //                     text: "Price for 10 days"
    //                 },
    //                 axisX: {
    //                     title: "Year",
    //                     valueFormatString: "####",
    //                     interval: 2
    //                 },
    //                 axisY: {
    //                     logarithmic: true, //change it to false
    //                     title: "price in USD (Log)",
    //                     prefix: "$",
    //                     titleFontColor: "#6D78AD",
    //                     lineColor: "#6D78AD",
    //                     gridThickness: 0,
    //                     lineThickness: 1,
    //                     labelFormatter: addSymbols
    //                 },
    //                 axisY2: {
    //                     title: "Profit in USD",
    //                     prefix: "$",
    //                     titleFontColor: "#51CDA0",
    //                     logarithmic: false, //change it to true
    //                     lineColor: "#51CDA0",
    //                     gridThickness: 0,
    //                     lineThickness: 1,
    //                     labelFormatter: addSymbols
    //                 },
    //                 legend: {
    //                     verticalAlign: "top",
    //                     fontSize: 16,
    //                     dockInsidePlotArea: true
    //                 },
    //                 data: graphDataPoints
    //             });
    //             chart.render();

    //             function addSymbols(e) {
    //                 var suffixes = ["", "K", "M", "B"];

    //                 var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
    //                 if (order > suffixes.length - 1)
    //                     order = suffixes.length - 1;

    //                 var suffix = suffixes[order];
    //                 return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
    //             }

    //         }
    //         $("#coinsAndGraph").append(`<div id="chartContainer" hidden style=" margin: 5% auto; height: auto; width: 80%;"></div>`)
    //         $("#coinsAndGraph").append(graph)
    //         $("#chartContainer").removeAttr("hidden")
    //     })



    // })
    // setting parallax
    let offsetTwo = window.pageYOffset
    let pos = parseInt($("#bigPlanet").css("top"))
    $(window).on("scroll", () => {
        let offset = window.pageYOffset;
        $("#header").css("backgroundPositionY", ` ${offset * -0.3}px`);
        // big planet scroll
        offsetTwo > (offsetTwo = window.pageYOffset) ? $("#bigPlanet").css("top", `${((offset * -0.3) + pos)}px`) : $("#bigPlanet").css("top", `${(offset * -0.3) + pos}px`);
    })

    $("#coinSearchButton").on("click", function () {

    })
    //     $("#coinSearchButton").on("click", function () {
    //         const allCoins = JSON.parse(localStorage.getItem("list of coins"))

    //         $("#coinsAndGraph").empty()
    //         const coin = allCoins.find(el => el.id == $("#coinSearchInput").val())
    //         if (coin != undefined) {
    //             const card =
    //                 `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
    //         <div class="coin-element">
    //             <img src="${coin.image.thumb}" class="thumb-image " alt="...">
    //         </div>

    //         <div class="coin-element">
    //             <h5 class="card-title">${coin.id}</h5>
    //         </div>

    //         <div style="margin:20% auto;" hidden id="buttonForMore${coin.symbol}Div"
    //             class="animate__animated animate__fadeInDown">
    //             <div class="coin-element">

    //                 <div class="coin-element">
    //                     <h5 class="card-title"> Current price</h5>
    //                 </div>

    //                 <div class="coin-element">
    //                     <h5 class="card-element">$ ${coin.market_data.current_price.usd}</h5>
    //                 </div>

    //                 <div class="coin-element">
    //                     <h5 class="card-element">€ ${coin.market_data.current_price.eur}</h5>
    //                 </div>

    //                 <div class="coin-element">
    //                     <h5 class="card-element">₪ ${coin.market_data.current_price.ils}</h5>
    //                 </div>

    //             </div>
    //         </div>
    //         <div class="coin-element">
    //             <button id="buttonForMore${coin.symbol}" class=" btn btn-primary">More info.</button>
    //         </div>

    // `
    //             $("#coinsAndGraph").append(card)
    //             $("button").on("click", function () {
    //                 $(`#${this.id}ParentDiv`).toggleClass("coin-div-more")
    //                 $(this).html() == "More info." ? $(this).html("less") : ($(this).html() == "less" ? $(this).html("More info.") : null);

    //                 $(`#${this.id}Div`).attr("hidden") == undefined ? $(`#${this.id}Div`).attr("hidden", "hidden") : $(`#${this.id}Div`).removeAttr("hidden");
    //             })
    //             checkToggle()
    //         }
    //         else { confirm("invalid coin exmaple : bitcoin") }
    //     })

});

//  creates an array with chosen coins gets the id of our coin 
let chooseMonitoredCoin = ourSwitch => {
    const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []
    if (ourSwitch.checked == true && chosenCoinArr.length <= 4) {
        chosenCoinArr.indexOf(ourSwitch.id) == -1 ? chosenCoinArr.push(ourSwitch.id,) : "";
        console.log(chosenCoinArr)
        localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
    } else if (ourSwitch.checked == false && chosenCoinArr.indexOf(ourSwitch.id) != -1) {
        let index = chosenCoinArr.indexOf(ourSwitch.id)
        chosenCoinArr.splice(index, 1)
        console.log(chosenCoinArr)
        localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
    } else if (ourSwitch.checked == true && chosenCoinArr.length > 4) {
        ourSwitch.checked = false
        chooseWhatToRemove()
    }
}


let chooseWhatToRemove = () => {
    // defining variables
    // const modal = document.getElementById("myModal");
    $("#myModal").css("display", "block")
    const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []

    // print coins inside a modal
    let displayChosenCoins = () => {
        // getting data again
        $("#coin-divs").empty()
        const coinData = JSON.parse(localStorage.getItem("list of coins")) || []
        //  creating modal cards
        chosenCoinArr.forEach(element => {
            const coin = coinData.find(el => el.symbol == element)

            $("#coin-divs").append(`
            <div class="coin-modal-card card border-secondary mb-3" style="border-radius: 25px; max-width: 18rem;">
            <div class="card-body"> <img src="${coin.image.thumb}" alt="" ></div>
            <div class="card-body text-secondary">
            <p class="card-text">${coin.id}</p>
            <div class="form-check switch form-switch">
            <input class="form-check-input" onclick="syncToggles(${coin.symbol})"  type="checkbox" role="switch" id="1${(coin.symbol)}"  style="margin:0% auto;">
            </div>
            </div>
            </div>
            `)
        })
    }
    displayChosenCoins()

    // modal events listener
    $(".modal-button").on("click", () => $("#myModal").css("display", "none"))
    $(window).on("click", function (event) {
        if (event.target == $("#myModal")) {
            modal.style.display = "none";
        }
    })

    checkToggle()
}

// gets data from toggling and checks if it was toggled in the past
let checkToggle = () => {
    const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []
    const arrayOfAllCoins = JSON.parse(localStorage.getItem("list of coins")) || []
    try {
        arrayOfAllCoins.forEach(element => {
            const input = document.getElementById(`${element.symbol}`)
            if (input != null) {
                chosenCoinArr.indexOf(input.id) != -1 ? input.checked = true : input.checked = false;
            }
        })
    } catch (error) {
        console.log(error)
    }
    try {
        arrayOfAllCoins.forEach(element => {
            const input = document.getElementById(`1${element.symbol}`)
            input != null ? input.checked = true : ""
        })
    } catch (error) {
        console.log(error)
    }
}

// syncing all toggles
let syncToggles = (ourInput) => {
    const inputA = document.getElementById(`1${ourInput.id}`)
    const inputB = ourInput
    inputA.checked == true ? inputB.checked = true : inputB.checked = false
    // // get array from ls
    const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins"))
    const indexOfCoin = chosenCoinArr.indexOf(inputB.id)
    if (inputA.checked == false) {
        chosenCoinArr.splice(indexOfCoin, 1)
    } else if (inputA.checked == true) {
        if (chosenCoinArr.indexOf(inputB.id) == -1 && chosenCoinArr.length <= 4) {
            chosenCoinArr.push(inputB.id)
        }
    }
    console.log(chosenCoinArr)
    // send array to ls
    localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
}