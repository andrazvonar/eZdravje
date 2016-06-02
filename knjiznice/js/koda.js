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
function generirajPodatke(stPacienta) {
    var ehrId = "";
    var sessionId = getSessionId();

    switch (stPacienta) {
        case 0:
            $.ajaxSetup({
                headers: {
                    "Ehr-Session": sessionId
                }
            });
            $.ajax({
                url: baseUrl + "/ehr",
                type: 'POST',
                success: function(data) {
                    var ehrId = data.ehrId;
                    var partyData = {
                        firstNames: "Jure",
                        lastNames: "Krajnc",
                        dateOfBirth: "",
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
                                $("#preberiEHRid").val(ehrId);
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
        default:
    }

    return ehrId;
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

function generiraj() {
    for (var i = 0; i < 3; i++) generirajPodatke(i);
}

var EHRids = ["ehr1", "ehr2", "ehr3"];

function napolniPoljeEHR(st) {
    document.getElementById("EHRid-vnos").value = EHRids[st];
    document.getElementById("prijava-btn").focus();
}

function prijavaUporabnika() {
    var id = $('#EHR-vnos');
    posodobiPodatke([10, 20, 30, 40, 70, 60], 186);
    document.getElementById("ime").innerHTML = "Andraž Zvonar";
    document.getElementById("kartica").style.display = "block";
    document.getElementById("kartica-pad").style.display = "block";
    document.getElementById("prijava").style.display = "none";
}

function odjava() {
    document.getElementById("kartica").style.display = "none";
    document.getElementById("kartica-pad").style.display = "none";
    document.getElementById("prijava").style.display = "block";
    document.getElementById("trenutni-BMI").innerHTML = "--.-";
    document.getElementById("BMI-sprememba").innerHTML = "--%";
    document.getElementById("EHRid-vnos").innerHTML = "";
    generateChart([0, 0, 0, 0, 0, 0]);
}

function posodobiPodatke(teze, visina) {
    document.getElementById("trenutni-BMI").innerHTML = BMI(teze[5], visina);
    document.getElementById("BMI-sprememba").innerHTML = Math.abs(Math.round((BMI(teze[5], visina) / BMI(teze[4], visina) - 1) * 100)) + "%";
    generateChart(teze);
}

function BMI(teza, visina) {
    return Math.round((teza / ((visina / 100) * (visina / 100)) * 10)) / 10;
}