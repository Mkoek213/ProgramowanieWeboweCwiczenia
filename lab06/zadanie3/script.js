document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRunSimulation();
});

async function fetchDataAndRunSimulation() {
    const response = await fetch('city.json');
    const citiesData = await response.json();
    
    const { projectedCities } = runSimulation(citiesData);
    
    displayTotalPopulation(projectedCities);
    displayTopProvinces(projectedCities);
    displayShrinkingSmallCities(projectedCities);
    displayAverageDensity(citiesData, projectedCities);
}

function runSimulation(citiesData) {
    const START_YEAR = 2024;
    const TARGET_YEAR = 2050;
    const DENSITY_CHECK_YEAR = 2035;
    
    const BIG_5_PROVINCES = ['małopolskie', 'pomorskie', 'mazowieckie', 'dolnośląskie', 'wielkopolskie'];
    const EASTERN_PROVINCES = ['podlaskie', 'lubelskie', 'podkarpackie', 'warmińsko-mazurskie', 'świętokrzyskie'];

    const projectedCities = citiesData.map(city => {
        let projectedCity = { 
            ...city, 
            initialPeople: city.people,
            initialDensity: city.density
        };

        for (let year = START_YEAR; year < TARGET_YEAR; year++) {
            let currentPeople = projectedCity.people;

            if (currentPeople > 100000) {
                if (BIG_5_PROVINCES.includes(projectedCity.province)) {
                    currentPeople *= 1.02;
                } else {
                    currentPeople *= 1.01;
                }
            } else if (currentPeople >= 10000 && currentPeople <= 100000) {
                currentPeople -= 650;
            } else if (currentPeople < 10000) {
                if (EASTERN_PROVINCES.includes(projectedCity.province)) {
                    if ((year - START_YEAR + 1) % 7 === 0) {
                        currentPeople *= 0.95;
                    }
                } else {
                    currentPeople += Math.floor(Math.random() * 61) - 30;
                }
            }
            
            projectedCity.people = Math.round(currentPeople);
            if (projectedCity.people < 0) {
                projectedCity.people = 0;
            }

            if (year === DENSITY_CHECK_YEAR) {
                const densityIn2035 = projectedCity.people / projectedCity.area;
                if (densityIn2035 > 1000) {
                    projectedCity.area *= 1.1;
                }
            }
        }
        
        projectedCity.density = projectedCity.people / projectedCity.area;
        return projectedCity;
    });

    return { projectedCities };
}

function displayTotalPopulation(cities) {
    const total = cities.reduce((sum, city) => sum + city.people, 0);
    document.getElementById('total-population').textContent = `${total.toLocaleString()} osób`;
}

function displayTopProvinces(cities) {
    const provinceData = {};
    cities.forEach(city => {
        if (!provinceData[city.province]) {
            provinceData[city.province] = { totalPeople: 0, cities: [] };
        }
        provinceData[city.province].totalPeople += city.people;
        provinceData[city.province].cities.push(city);
    });

    const sortedProvinces = Object.entries(provinceData)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.totalPeople - a.totalPeople)
        .slice(0, 5);

    const container = document.getElementById('top-provinces');
    container.innerHTML = '';
    
    sortedProvinces.forEach(province => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.innerHTML = `<strong>${province.name}</strong> (${Math.round(province.totalPeople).toLocaleString()} mieszkańców)`;
        
        const cityList = document.createElement('ul');
        cityList.className = 'province-cities';
        
        province.cities
            .sort((a, b) => b.people - a.people)
            .forEach(city => {
                const li = document.createElement('li');
                li.textContent = `${city.name}: ${city.people.toLocaleString()} (Gęstość: ${city.density.toFixed(2)} os./km²)`;
                cityList.appendChild(li);
            });
        
        details.appendChild(summary);
        details.appendChild(cityList);
        container.appendChild(details);
    });
}

function displayShrinkingSmallCities(cities) {
    const shrinkingCities = cities
        .filter(city => city.initialPeople < 10000 && city.people < city.initialPeople)
        .sort((a, b) => a.name.localeCompare(b.name));
        
    const container = document.getElementById('shrinking-cities');
    const ul = document.createElement('ul');
    

    shrinkingCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name} (Było: ${city.initialPeople.toLocaleString()} -> Jest: ${city.people.toLocaleString()})`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

function displayAverageDensity(originalCities, projectedCities) {
    const currentLargeCities = originalCities.filter(c => c.people > 100000);
    const currentTotalDensity = currentLargeCities.reduce((sum, c) => sum + c.density, 0);
    const currentAvgDensity = currentLargeCities.length > 0 ? (currentTotalDensity / currentLargeCities.length) : 0;

    const projectedLargeCities = projectedCities.filter(c => c.people > 100000);
    const projectedTotalDensity = projectedLargeCities.reduce((sum, c) => sum + c.density, 0);
    const projectedAvgDensity = projectedLargeCities.length > 0 ? (projectedTotalDensity / projectedLargeCities.length) : 0;

    document.getElementById('avg-density').textContent = 
        `Aktualnie: ${currentAvgDensity.toFixed(2)} os./km² | Prognoza 2050: ${projectedAvgDensity.toFixed(2)} os./km²`;
}