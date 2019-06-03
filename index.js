function callNutritionixAPI(allFoodDetails, createNutritionLabel) {
    let query = {
        "url": "https://trackapi.nutritionix.com/v2/natural/nutrients",
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "accept": "application/json",
            "x-app-id": "039db79f",
            "x-app-key": "52cacf0e69046fa519fd29eeb6151cb6",
            "x-remote-user-id": 0,
            "cache-control": "no-cache"
        },
        "processData": false,
        "data": JSON.stringify({
            query: allFoodDetails,
            num_servings: 1,
            line_delimited: false,
            use_raw_foods: false,
            include_subrecipe: false
        }),
        success: getNutritionData,
        error: ajaxFailureResponse
    }
    $.ajax(query);
}

function getNutritionData(response) {
    $('.exercise').show();
    let foodResults = displayFoodTable(response.foods);
    let foodLabel = calculateNutrition(response.foods);
    $('.js-getNutrition').html(foodLabel);
}

function ajaxFailureResponse(data) {
    $('.results').html(`<p class="error">${data.responseJSON.message}</p>`);
}

function displayFoodTable(foods) {
    let tableHeader =
        `<tr>
        <th></th>
        <th>Qty</th>
        <th>Food</th>
        <th>Calories</th>
        <th>Weight</th>
        <th>Group</th>`;
    let tableRow = mapRow(foods);
    $('.results').html(`${tableHeader} ${tableRow}`);
}


function mapRow(foods) {
    let foodDetails = [];
    foodDetails = foods.map(food =>
        `<tr>
         <td><img src=${food.photo.thumb} class="foodImage" alt="Image of ${food.food_name}"/></td>
         <td>${food.tags.quantity}</td>
         <td><a href="https://www.nutritionix.com/food/${food.food_name}" class="link" target="_blank">${food.food_name}</a></td>
         <td>${food.nf_calories}</td>
         <td>${food.serving_weight_grams} g</td>
         <td>${getFoodGroupName(food.tags.food_group)}</td>
         </tr>`);
    return foodDetails;
}

function getFoodGroupName(foodGroup) {
    const foodGroupArray = ['Dairy', 'Protein', 'Fruit', 'Vegetable', 'Grain', 'Fat', 'Legume', 'Combination', 'Not applicable'];
    if (foodGroup > 0 && foodGroup < 10) {
        return foodGroupArray[foodGroup - 1];
    } else
        return foodGroupArray[8];
}


function calculateNutrition(food) {
    let totalNutrition = food.reduce((obj1, obj2) => {
        for (let k in obj2) {
            if (obj2.hasOwnProperty(k))
                obj1[k] = (obj1[k] || 0) + obj2[k];
        }
        return obj1;
    }, {});
    createFoodLabel(totalNutrition);
}

function getVitaminValue(food, number) {
    let vitaminValue;
    for (let i = 0; i < food.length; i++) {
        vitaminValue += food[i].full_nutrients[number].value;
        return vitaminValue;
    }
}

function createFoodLabel(totalNutrition) {

    let label = $('.js-nutritionLabel').nutritionLabel({
        'showServingUnitQuantity': false,
        'valueCalories': `${totalNutrition.nf_calories}`,
        'valueTotalFat': `${totalNutrition.nf_total_fat}`,
        'valueSatFat': `${totalNutrition.nf_saturated_fat}`,
        'valueTransFat': 0,
        'valueCholesterol': `${totalNutrition.nf_cholesterol}`,
        'valueSodium': `${totalNutrition.nf_sodium}`,
        'valueTotalCarb': `${totalNutrition.nf_total_carbohydrate}`,
        'valueFibers': `${totalNutrition.nf_dietary_fiber}`,
        'valueSugars': `${totalNutrition.nf_sugars}`,
        'valueProteins': `${totalNutrition.nf_protein}`,
        'naVitaminA': true,
        'naVitaminC': true,
        'naCalcium': true,
        'naIron': true,
    });
}

function sendExerciseDetails(exerciseDetails, callback) {
    let exerciseRequest = {
        "url": "https://trackapi.nutritionix.com/v2/natural/exercise",
        "method": "POST",
        "headers": {
            "x-app-id": "039db79f",
            "x-app-key": "edffc89a0cc7397efe3a456d0349b798",
            "content-type": "application/json",
            "cache-control": "no-cache",
            "postman-token": "3cc91911-d1a7-a4bc-0f41-b71bcc2ac34e"
        },
        "processData": false,
        "data": JSON.stringify({
            query: exerciseDetails
        }),
        success: callback,
        error: ajaxFailureResponse
    }
    $.ajax(exerciseRequest);
}


function calculateCaloriesBurnt(data) {
    if (data.exercises.length > 0) {
        let exerciseResult = `<p>You burnt <span class="sample">${data.exercises[0].nf_calories} </span>calories</p>`;
        $('.res').html(exerciseResult);
    } else
        $('.res').html(`<p class="error">Please provide valid input`);
}


function getExerciseData() {
    return function (event) {
        event.preventDefault();
        const exerciseDetails = $('.userExerciseDetails').val();
        if(exerciseDetails!=''){
        sendExerciseDetails(exerciseDetails, calculateCaloriesBurnt);
        }
        else{
        $('.res').html(`<p class="error">Please provide valid input`);
        }

    };
}

function getNutritionDetails() {
    return function (event) {
        event.preventDefault();
        const breakfast = $('.js-morning').val();
        const lunch = $('.js-noon').val();
        const snacks = $('.js-snacks').val();
        const dinner = $('.js-dinner').val();
        const allFoodDetails = `${breakfast} and ${lunch} and ${snacks} and ${dinner}`;
        if (breakfast != '' || lunch != '' || snacks != '' || dinner != '') {
            callNutritionixAPI(allFoodDetails.trim(), getNutritionData);
        } else {
            $('.results').html(`<p class="error" role="alert">Enter any of the inputs!</p>`);
        }
    }
}

function proceedClickHandler() {
    return function clickProceedHandler() {
        $('.food').show();
        $('.label').show();
    };
}


$('.food').hide();
$('.exercise').hide();
$('.container').on('click', '.proceed', proceedClickHandler());

$('.js-getNutrition').on('click', getNutritionDetails());
$('.js-getExercise').on('click', getExerciseData());
