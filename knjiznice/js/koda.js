var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
            "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta, callback) {
    var ehrId;
    var sessionId = getSessionId();

    switch (stPacienta) {
        case 1:
            $.ajaxSetup({
                headers: {
                    "Ehr-Session": sessionId
                }
            });
            $.ajax({
                url: baseUrl + "/ehr",
                type: 'POST',
                success: function(data) {
                    ehrId = data.ehrId;
                    var partyData = {
                        firstNames: "Andraž",
                        lastNames: "Zver",
                        dateOfBirth: "1996-02-23T18:08",
                        gender: "MALE",
                        partyAdditionalInfo: [{
                            key: "ehrId",
                            value: ehrId
                        }]
                    };
                    $.ajax({
                        url: baseUrl + "/demographics/party",
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(partyData),
                        success: function(party) {
                            if (party.action == 'CREATE') {
                                $("#kreirajSporocilo").html("<span class='obvestilo " +
                                    "label label-success fade-in'>Uspešno kreiran EHR '" +
                                    ehrId + "'.</span>");
                                callback(ehrId);
                            }
                        },
                        error: function(err) {
                            console.log("NAPAKA");
                            $("#kreirajSporocilo").html("<span class='obvestilo label " +
                                "label-danger fade-in'>Napaka '" +
                                JSON.parse(err.responseText).userMessage + "'!");
                        }
                    });
                }
            });
            break;

        case 2:
            $.ajaxSetup({
                headers: {
                    "Ehr-Session": sessionId
                }
            });
            $.ajax({
                url: baseUrl + "/ehr",
                type: 'POST',
                success: function(data) {
                    ehrId = data.ehrId;
                    var partyData = {
                        firstNames: "Miran",
                        lastNames: "Mlakar",
                        dateOfBirth: "1976-03-03T11:01",
                        partyAdditionalInfo: [{
                            key: "ehrId",
                            value: ehrId
                        }]
                    };
                    $.ajax({
                        url: baseUrl + "/demographics/party",
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(partyData),
                        success: function(party) {
                            if (party.action == 'CREATE') {
                                $("#kreirajSporocilo").html("<span class='obvestilo " +
                                    "label label-success fade-in'>Uspešno kreiran EHR '" +
                                    ehrId + "'.</span>");
                                callback(ehrId);
                            }
                        },
                        error: function(err) {
                            $("#kreirajSporocilo").html("<span class='obvestilo label " +
                                "label-danger fade-in'>Napaka '" +
                                JSON.parse(err.responseText).userMessage + "'!");
                        }
                    });
                }
            });
            break;

        case 3:
            $.ajaxSetup({
                headers: {
                    "Ehr-Session": sessionId
                }
            });
            $.ajax({
                url: baseUrl + "/ehr",
                type: 'POST',
                success: function(data) {
                    ehrId = data.ehrId;
                    var partyData = {
                        firstNames: "Tanja",
                        lastNames: "Kranjc",
                        dateOfBirth: "1987-08-21T18:08",
                        partyAdditionalInfo: [{
                            key: "ehrId",
                            value: ehrId
                        }]
                    };
                    $.ajax({
                        url: baseUrl + "/demographics/party",
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(partyData),
                        success: function(party) {
                            if (party.action == 'CREATE') {
                                $("#kreirajSporocilo").html("<span class='obvestilo " +
                                    "label label-success fade-in'>Uspešno kreiran EHR '" +
                                    ehrId + "'.</span>");
                                callback(ehrId);
                            }
                        },
                        error: function(err) {
                            $("#kreirajSporocilo").html("<span class='obvestilo label " +
                                "label-danger fade-in'>Napaka '" +
                                JSON.parse(err.responseText).userMessage + "'!");
                        }
                    });
                }
            });
    }

    return ehrId;
}

function dodajMeritve(ehrId, datumInUra, telesnaTeza, telesnaVisina, merilec) {
    var sessionId = getSessionId();
    if (!ehrId || ehrId.trim().length == 0) {
        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
            "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
        console.log("ERR")
    }
    else {
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        var podatki = {
            // Struktura predloge je na voljo na naslednjem spletnem naslovu:
            // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
            "ctx/language": "en",
            "ctx/territory": "SI",
            "ctx/time": datumInUra,
            "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
            "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
        };
        var parametriZahteve = {
            ehrId: ehrId,
            templateId: 'Vital Signs',
            format: 'FLAT',
            committer: merilec
        };
        $.ajax({
            url: baseUrl + "/composition?" + $.param(parametriZahteve),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(podatki),
            success: function(res) {
                $("#dodajMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-success fade-in'>" +
                    res.meta.href + ".</span>");
            },
            error: function(err) {
                console.log(err);
                $("#dodajMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
            }
        });
    }
}

function preberiEHRodBolnika(ehrId, callback) {
    var sessionId = getSessionId();

    if (false) {
        $("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
            "fade-in'>Prosim vnesite zahtevan podatek!");
    }
    else {
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(data) {
                var party = data.party;
                callback(party);
                $("#preberiSporocilo").html("<span class='obvestilo label " +
                    "label-success fade-in'>Bolnik '" + party.firstNames + " " +
                    party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
                    "'.</span>");
            },
            error: function(err) {
                console.log("NAPAKA")
                $("#preberiSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
            }
        });
    }
}

function preberiMeritveTeze(ehrId, callback) {
    var sessionId = getSessionId();
    var tip = $("#preberiTipZaVitalneZnake").val();

    if (!ehrId || ehrId.trim().length == 0) {
        $("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
            "label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
    }
    else {
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(data) {
                var party = data.party;
                $("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje " +
                    "podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames +
                    " " + party.lastNames + "'</b>.</span><br/><br/>");
                $.ajax({
                    url: baseUrl + "/view/" + ehrId + "/" + "weight",
                    type: 'GET',
                    headers: {
                        "Ehr-Session": sessionId
                    },
                    success: function(res) {
                        if (res.length > 0) {
                            callback(res);

                        }
                        else {
                            $("#preberiMeritveVitalnihZnakovSporocilo").html(
                                "<span class='obvestilo label label-warning fade-in'>" +
                                "Ni podatkov!</span>");
                        }
                    },
                    error: function(err) {
                        $("#preberiMeritveVitalnihZnakovSporocilo").html(
                            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                            JSON.parse(err.responseText).userMessage + "'!");
                    }
                });
            },
            error: function(err) {
                console.log("Napaka");
                $("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
            }
        });
    }
}

function preberiMeritveVisine(ehrId, callback) {
    var sessionId = getSessionId();
    var tip = $("#preberiTipZaVitalneZnake").val();

    if (!ehrId || ehrId.trim().length == 0) {
        $("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
            "label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
    }
    else {
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(data) {
                $.ajax({
                    url: baseUrl + "/view/" + ehrId + "/" + "height",
                    type: 'GET',
                    headers: {
                        "Ehr-Session": sessionId
                    },
                    success: function(res) {
                        if (res.length > 0) {
                            callback(res);

                        }
                        else {
                            $("#preberiMeritveVitalnihZnakovSporocilo").html(
                                "<span class='obvestilo label label-warning fade-in'>" +
                                "Ni podatkov!</span>");
                        }
                    },
                    error: function(err) {
                        $("#preberiMeritveVitalnihZnakovSporocilo").html(
                            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                            JSON.parse(err.responseText).userMessage + "'!");
                    }
                });
            },
            error: function(err) {
                console.log("Napaka");
                $("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
            }
        });
    }
}



// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
$(document).ready(function() {
    generateChart([0, 0, 0, 0, 0, 0]);
});


function generateChart(values) {
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["", "", "", "", "", ""],
            datasets: [{
                label: 'telesna masa',
                data: values,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

var EHRids = ["", "", ""];

function generiraj() {
    generirajPodatke(1, function(ehrId) {
        EHRids[0] = ehrId;
        dodajMeritve(ehrId, "2016-1-2T21:17", 60, 186, "Jožica");
        dodajMeritve(ehrId, "2016-2-2T21:17", 65, 186, "Jožica");
        dodajMeritve(ehrId, "2016-3-2T21:17", 67, 186, "Jožica");
        dodajMeritve(ehrId, "2016-4-2T21:17", 73, 186, "Jožica");
        dodajMeritve(ehrId, "2016-5-2T21:17", 68, 186, "Jožica");
        dodajMeritve(ehrId, "2016-6-2T21:17", 74, 186, "Jožica");
    });
    generirajPodatke(2, function(ehrId) {
        EHRids[1] = ehrId;
        dodajMeritve(ehrId, "2016-1-2T21:17", 90, 178, "Tine");
        dodajMeritve(ehrId, "2016-2-2T21:17", 88, 178, "Tine");
        dodajMeritve(ehrId, "2016-3-2T21:17", 80, 178, "Tine");
        dodajMeritve(ehrId, "2016-4-2T21:17", 78, 178, "Tine");
        dodajMeritve(ehrId, "2016-5-2T21:17", 85, 178, "Tine");
        dodajMeritve(ehrId, "2016-5-31T21:17", 102, 178, "Tine");
    });
    generirajPodatke(3, function(ehrId) {
        EHRids[2] = ehrId;
        dodajMeritve(ehrId, "2016-1-2T21:17", 70, 170, "Samo");
        dodajMeritve(ehrId, "2016-2-2T21:17", 70, 170, "Samo");
        dodajMeritve(ehrId, "2016-3-2T21:17", 60, 170, "Samo");
        dodajMeritve(ehrId, "2016-4-2T21:17", 58, 170, "Samo");
        dodajMeritve(ehrId, "2016-5-2T21:17", 55, 170, "Samo");
        dodajMeritve(ehrId, "2016-6-1T21:17", 49, 170, "Samo");
    });

}

function napolniPoljeEHR(st) {
    document.getElementById("EHRid-vnos").value = EHRids[st];
    document.getElementById("prijava-btn").focus();
}

var CURRENTID = "";

function prijavaUporabnika() {
    CURRENTID = document.getElementById("EHRid-vnos").value;
    preberiEHRodBolnika(CURRENTID, function(party) {
        document.getElementById("ime").innerHTML = party.firstNames + " " + party.lastNames;
        document.getElementById("kartica").style.display = "block";
        document.getElementById("kartica-pad").style.display = "block";
        document.getElementById("prijava").style.display = "none";
        document.getElementById("vnos").style.display = "block";
    });


    var teze = [0, 0, 0, 0, 0, 0];
    preberiMeritveTeze(CURRENTID, function(results) {
        var zadnja = results.length - 1;
        if (results.length >= 6) {
            for (var i = 0; i < 6; i++) {
                teze[i] = results[i].weight;
            }
        }
        else {
            for (var i = 0; i < results.length; i++) {
                teze[i] = results[i].weight;
            }
        }

        preberiMeritveVisine(CURRENTID, function(visine) {
            var visina = visine[0].height;
            var bmi = BMI(teze[5], visina)
            document.getElementById("k-bmi").innerHTML = bmi;
            document.getElementById("k-visina").innerHTML = visina + "cm";
            document.getElementById("trenutni-BMI").innerHTML = bmi;
            document.getElementById("BMI-sprememba").innerHTML = Math.abs(Math.round((bmi / BMI(teze[1], visina) - 1) * 100)) + "%";

            if (bmi < 18.5) {
                document.getElementById("NajprejPrijavit").style.display = "none";
                document.getElementById("k-ocena").innerHTML = "Podhranjenost";
                document.getElementById("clanek-4").style.display = "initial";
                document.getElementById("clanek-4").style.cursor = "pointer";
                document.getElementById("clanek-5").style.display = "initial";
                document.getElementById("clanek-5").style.cursor = "pointer";
            }
            else if (bmi < 24.5) {
                document.getElementById("k-ocena").innerHTML = "Normalno";
                document.getElementById("NajprejPrijavit").style.display = "none";
                document.getElementById("clanek-6").style.display = "initial";
                document.getElementById("clanek-6").style.cursor = "pointer";
                document.getElementById("clanek-7").style.display = "initial";
                document.getElementById("clanek-7").style.cursor = "pointer";
            }
            else if (bmi < 29.9) {
                document.getElementById("k-ocena").innerHTML = "Povišana teža";
                document.getElementById("k-ocena").innerHTML = "Kolega, debel si"
                document.getElementById("NajprejPrijavit").style.display = "none";
                document.getElementById("clanek-1").style.display = "initial";
                document.getElementById("clanek-1").style.cursor = "pointer";
                document.getElementById("clanek-2").style.display = "initial";
                document.getElementById("clanek-2").style.cursor = "pointer";
                document.getElementById("clanek-3").style.display = "initial";
                document.getElementById("clanek-3").style.cursor = "pointer";
            }
            else {
                document.getElementById("k-ocena").innerHTML = "Kolega, debel si"
                document.getElementById("NajprejPrijavit").style.display = "none";
                document.getElementById("clanek-1").style.display = "initial";
                document.getElementById("clanek-1").style.cursor = "pointer";
                document.getElementById("clanek-2").style.display = "initial";
                document.getElementById("clanek-2").style.cursor = "pointer";
                document.getElementById("clanek-3").style.display = "initial";
                document.getElementById("clanek-3").style.cursor = "pointer";

            }
        });

        document.getElementById("k-teza").innerHTML = teze[0] + "kg";
        document.getElementById("k-datum").innerHTML = results[0].time.slice(0, 10);
        generateChart(teze.reverse());
    });
}

function odjava() {
    CURRENTID = "";
    document.getElementById("kartica").style.display = "none";
    document.getElementById("kartica-pad").style.display = "none";
    document.getElementById("vnos").style.display = "none";
    document.getElementById("prijava").style.display = "block";
    document.getElementById("trenutni-BMI").innerHTML = "--.-";
    document.getElementById("BMI-sprememba").innerHTML = "--%";
    document.getElementById("EHRid-vnos").value = "";
    document.getElementById("NajprejPrijavit").style.display = "block";
    for (var i = 1; i <= 7; i++) {
        document.getElementById("clanek-" + i).style.cursor = "default";
        document.getElementById("clanek-" + i).style.display = "none";
    }
    generateChart([0, 0, 0, 0, 0, 0]);
}


function BMI(teza, visina) {
    return Math.round((teza / ((visina / 100) * (visina / 100)) * 10)) / 10;
}

function dodajNovoMeritev() {
    var telesnaTeza = document.getElementById("masa-vnos").value;
    var telesnaVisina = document.getElementById("visina-vnos").value;
    var d = new Date();
    var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.getHours() + ":" + d.getMinutes();
    dodajMeritve(CURRENTID, date, telesnaTeza, telesnaVisina, "Samo");
    document.getElementById("masa-vnos").value = "";
    document.getElementById("visina-vnos").value = "";
}

function naloziRecept(st) {
    var text = document.getElementById("text-" + st);
    text.style.display = text.style.display == "initial" ? "none" : "initial";
}