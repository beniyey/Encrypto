///  <reference path="jquery-3.6.0.js"/>


$(function () {

    // getting all data about our coins from the server and storing it in the local storage
    //or further use in other functions
    dataFetchFromGecko = async () => {
        try {
            const coinData = await fetch("https://api.coingecko.com/api/v3/coins");
            const allCoinsArr = await coinData.json()
            localStorage.setItem("list of coins", JSON.stringify(allCoinsArr))
        } catch (err) {
            console.log(err)
        }
    }
    //fetches new data every 2 minutes
    setInterval(() => { dataFetchFromGecko() }, 120000)

    dataFetchFromGecko()

    // checks if each input is toggled at each point
    function checkToggle() {
        const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []
        const allCoinsArr = JSON.parse(localStorage.getItem("list of coins")) || []
        chosenCoinArr.forEach(element => $(`#${element.id}`).attr("checked", "checked"));
        allCoinsArr.forEach(element => {
            if (chosenCoinArr.find(el => el.id == element.symbol) == undefined && document.getElementById(`${element.symbol}`) != null) {
                document.getElementById(`${element.symbol}`).checked = false
            }
        })
    }


    // displays coin data ( graph , chosen coins and all coins )
    async function coinsAndGraph(cardCondition) {
        let card = ''
        // fetches data and renders loader
        if (JSON.parse(localStorage.getItem("list of coins")) == null) {
            card = ` <img src="./assets/photos/loader.gif" alt="">`
            $("#coinsAndGraph").append(card)
            await dataFetchFromGecko()
        }

        $("#coinsAndGraph").empty()
        const allCoinsArr = JSON.parse(localStorage.getItem("list of coins"))
        const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins"))

        if (cardCondition == "all") {
            for (const coin of allCoinsArr) {
                card =
                    `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
        <div class="coin-element">
            <img src="${coin.image.thumb}" class="thumb-image " alt="...">
        </div>

        <div class="coin-element">
            <h5 class="card-title">${coin.id}</h5>
        </div>

        <div style="margin:0% auto;" class="form-check form-switch">
            <input style="margin:10% 25%;" class="form-check-input coin-input" 
                type="checkbox" role="switch" id="${coin.symbol}">
        </div>

        <div class="coin-element">
        <button id="buttonForMore${coin.symbol}" class="more-info-for-coin btn btn-primary">More info.</button>
         </div>
     
         <div id="moreInfoFor${coin.symbol}">
         </div>

`
                $("#coinsAndGraph").append(card)
            }
        }
        if (cardCondition == "chosen") {
            // validation of existing coins 
            if (chosenCoinArr.length <= 0) {
                alert("you haven't picked any coins to present yet ")
                return coinsAndGraph("all");
            }
            chosenCoinArr.forEach(element => {
                const coin = allCoinsArr.find(coin => coin.symbol == element.id)
                card =
                    `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
                    <div class="coin-element">
                        <img src="${coin.image.thumb}" class="thumb-image " alt="...">
                    </div>
            
                    <div class="coin-element">
                        <h5 class="card-title">${coin.id}</h5>
                    </div>
            
                    <div style="margin:0% auto;" class="form-check form-switch">
                        <input style="margin:10% 25%;" class="form-check-input coin-input"
                            type="checkbox" role="switch" id="${coin.symbol}">
                    </div>

                    <div class="coin-element">
                        <button id="buttonForMore${coin.symbol}" class="more-info-for-coin btn btn-primary">More info.</button>
                    </div>
        
                    <div id="moreInfoFor${coin.symbol}" >
                    </div>
        `
                $("#coinsAndGraph").append(card)
            })
        }
        if (cardCondition == "live") {
            if (chosenCoinArr.length <= 0) {
                alert("you haven't picked any coins to present yet ")
                return coinsAndGraph("all");
            }
            let graphDataPointsBySeconds = []

            chosenCoinArr.forEach(async (element) => {
                const coin = allCoinsArr.find(coin => coin.symbol == element.id)

                graphDataPointsBySeconds.push({
                    type: "spline",
                    name: `${coin.id}`,
                    showInLegend: true,
                    xValueFormatString: ``,
                    yValueFormatString: "#,##0 $",
                    dataPoints: []
                })
            })

            let graph = function () {

                var chart = new CanvasJS.Chart("chartContainer1", {
                    animationEnabled: true,
                    zoomEnabled: true,
                    theme: "dark2",
                    title: {
                        text: "current price"
                    },
                    axisX: {
                        title: "Time",
                        valueFormatString: "####",
                        interval: 0
                    },
                    axisY: {
                        logarithmic: false,
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
                        fontSize: 10,
                        dockInsidePlotArea: true
                    },
                    data: graphDataPointsBySeconds
                });
                chart.render();

                // adds data every two minutes
                addBySeconds = setInterval(async () => {
                    const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins"))
                    let coinName = ''
                    chosenCoinArr.forEach(el => coinName += `${el.id.toUpperCase()},`)
                    const seconds = new Date().getSeconds()
                    try {
                        const priceData = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=${coinName}`)
                        let coinPrice = await priceData.json()
                        graphDataPointsBySeconds.forEach((el, index) => el.dataPoints.push({ x: seconds, y: coinPrice[Object.keys(coinPrice)[index]] }))
                        chart.render();
                    } catch (error) {
                        console.log(error.message)
                    }
                }, 2000);

                function addSymbols(e) {
                    var suffixes = ["", "K", "M", "B"];

                    var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
                    if (order > suffixes.length - 1)
                        order = suffixes.length - 1;

                    var suffix = suffixes[order];
                    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
                }

            }
            $("#coinsAndGraph").append(`<div id="chartContainer1" hidden class="graph-of-coins"></div>`)
            $("#coinsAndGraph").append(graph)
            $("#chartContainer1").removeAttr("hidden")

        }
        if (cardCondition == "search") {
            // validation for searching
            if (allCoinsArr.find(el => el.symbol.includes(`${$("#coinSearchInput").val().toLowerCase()}`)) == undefined) {
                alert("found no matches for your search, try again")
                return coinsAndGraph("all");
            }
            allCoinsArr.forEach(el => {
                if (el.symbol.includes(`${$("#coinSearchInput").val().toLowerCase()}`)) {
                    const coin = el
                    card =
                        `<div id="buttonForMore${coin.symbol}ParentDiv" class="animate__animated animate__fadeInUp coin-div">
        <div class="coin-element">
            <img src="${coin.image.thumb}" class="thumb-image " alt="...">
        </div>

        <div class="coin-element">
            <h5 class="card-title">${coin.id}</h5>
        </div>

        <div style="margin:0% auto;" class="form-check form-switch">
            <input style="margin:10% 25%;" class="form-check-input coin-input" 
                type="checkbox" role="switch" id="${coin.symbol}">
        </div>

        <div class="coin-element">
        <button id="buttonForMore${coin.symbol}" class="more-info-for-coin btn btn-primary">More info.</button>
         </div>
     
         <div id="moreInfoFor${coin.symbol}">
         </div>

`
                    $("#coinsAndGraph").append(card)
                }
            })
        }
        checkToggle()

        // adds info to the card about price every two minutes
        $(".more-info-for-coin").on("click", function () {
            $(`#${this.id}ParentDiv`).toggleClass("coin-div-more")
            const allCoinsArr = JSON.parse(localStorage.getItem("list of coins"))
            const coin = allCoinsArr.find(coin => coin.symbol == this.id.replace("buttonForMore", ""))
            if (this.innerHTML == "More info.") {
                card = `
                <div style="margin:20% auto;" id="buttonForMore${coin.symbol}Div"
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


`
                $(`#moreInfoFor${coin.symbol}`).append(card)
                this.innerHTML = "Less."
            } else {
                this.innerHTML = "More info."
                $(`#moreInfoFor${coin.symbol}`).empty();
                return
            }
        })

        // adds chosen coins to a dedicated array so we can use them later
        $(".coin-input").on("change", function () {
            const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []
            if (this.checked == true && chosenCoinArr.length <= 4) {
                chosenCoinArr.indexOf(this.id) == -1 ? chosenCoinArr.push({ id: this.id, checked: this.checked }) : "";
                console.log(chosenCoinArr)
                localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
            } else if (this.checked == false && chosenCoinArr.findIndex(el => el.id == this.id) != -1) {
                let index = chosenCoinArr.findIndex(el => el.id == this.id)
                chosenCoinArr.splice(index, 1)
                console.log(chosenCoinArr)
                localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
            } else if (this.checked == true && chosenCoinArr.length > 4) {
                this.checked = false
                chooseWhatToRemove(this)
            };
        })
    }

    // invoking the print function with different conditions and button navigation (scroll to section on click)
    coinsAndGraph("all") // default 
    $("#allCoins").on("click", () => {
        coinsAndGraph("all")
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#coinSearchInput").offset().top
        }, 0);
    })
    $("#myCoins").on("click", () => {
        coinsAndGraph("chosen")
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#coinSearchInput").offset().top
        }, 0);
    })
    $("#liveReports").on("click", () => {
        coinsAndGraph("live")
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#coinSearchInput").offset().top
        }, 0);
    })
    $("#coinSearchButton").on("click", () => {
        coinsAndGraph("search")
    })
    $("#navbarLogo").on("click", () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#header").offset().top
        }, 0);
    })

    // invokes a modal which presents all of our chosen coins in case we pick to many 
    function chooseWhatToRemove(chosen) {

        $("#myModal").css("display", "block")
        const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []

        // print coins inside a modal
        let displayChosenCoins = () => {
            $("#chosenCoin").empty()
            $("#chosenCoins").empty()

            const coinData = JSON.parse(localStorage.getItem("list of coins")) || []

            // printing the coin that triggered the modal
            const chosenCoin = coinData.find(el => el.symbol == chosen.id)
            $("#chosenCoin").append(`
            <div class="coin-modal-card card border-secondary mb-3" style="border-radius: 25px; max-width: 18rem;">
            <div class="card-body"> <img src="${chosenCoin.image.thumb}" alt="" ></div>
            <div class="card-body text-secondary">
            <p class="card-text">${chosenCoin.id}</p>
            <div class="form-check switch form-switch">
            <input class="form-check-input coin-input" type="checkbox" role="switch" id="remove${(chosenCoin.symbol)}"  style="margin:0% auto;">
            </div>
            </div>
            </div>
            `)


            // presents all of your chosen coins
            chosenCoinArr.forEach(element => {
                const coin = coinData.find(el => el.symbol == element.id)
                $("#chosenCoins").append(`
                <div class="coin-modal-card card border-secondary mb-3" style="border-radius: 25px; max-width: 18rem;">
                <div class="card-body"> <img src="${coin.image.thumb}" alt="" ></div>
                <div class="card-body text-secondary">
                <p class="card-text">${coin.id}</p>
                <div class="form-check switch form-switch">
                <input class="form-check-input coin-input" checked type="checkbox" role="switch" id="remove${(coin.symbol)}"  style="margin:0% auto;">
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


        $(".coin-input").on("change", function () {
            const chosenCoinArr = JSON.parse(localStorage.getItem("chosen coins")) || []
            const id = this.id.replace("remove", '')
            if (this.checked == true && chosenCoinArr.length <= 4 && chosenCoinArr.find(el => el.id == this.id) == undefined) {
                chosenCoinArr.indexOf(id) == -1 ? chosenCoinArr.push({ id: id, checked: this.checked }) : "";
                localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
            } else if (this.checked == false && chosenCoinArr.findIndex(el => el.id == id) != -1) {
                let index = chosenCoinArr.findIndex(el => el.id == id)
                chosenCoinArr.splice(index, 1)
                localStorage.setItem("chosen coins", JSON.stringify(chosenCoinArr))
            } else if (this.checked == true && chosenCoinArr.length >= 4) {
                this.checked = false
                alert("please choose up to 5 coins")
            }
            checkToggle()
        })

    }


    // creates parallax effect by using offset
    let offsetTwo = window.pageYOffset
    let pos = parseInt($("#bigPlanet").css("top"))
    $(window).on("scroll", () => {
        let offset = window.pageYOffset;
        $("#header").css("backgroundPositionY", ` ${offset * -0.3}px`);
        // big planet scroll
        offsetTwo > (offsetTwo = window.pageYOffset) ? $("#bigPlanet").css("top", `${((offset * -0.3) + pos)}px`) : $("#bigPlanet").css("top", `${(offset * -0.3) + pos}px`);
    })


});