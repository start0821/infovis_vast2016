/*
파일 불러오고, 데이터 전처리하는 등 공통적인 함수들을 구현하는데 필요한 파일.
*/

// 이는 아직 dictionary의 key값만 alphabetic으로 정해주고, value값은 무조건 string으로 대입함.
// 그렇기 때문에 type conversion은 data preprocessing에서 작업해주어야함.
// proxy_analysis.js 참고.
function _csv_successFunction(obj, data, delimeter){
    var data = data.split('\r\n')
    var array_data = data.map((d)=>d.split(delimeter))
    // csv 에서 column이름 값을 추출해 key로 사용. (non alphabetic 값은 제거함.)
    const key = array_data[0];
    for(var i=1;i<array_data.length;i++){
        var tmp = {};
        let row = array_data[i];
        for(var k in key){
            tmp[key[k]] = row[k];
        }
        obj.push(tmp);
    }
}

// read csv file and make data in list(dictionary)
// global 변수로 저장하고 이를 obj를 통해 reference passing을 한다. 
// 이 함수를 호출하면 parameter로 넣은 global 변수가 바뀌어있을 것이다. 
function csv_successFunction(obj){
    return R.curry(_csv_successFunction)(obj);
}

function getMonth(m){
    if(m==5) return "May";
    else return "June";
}

function getTime(timestamp){
    function getWeekDay(date){
        //Create an array containing each day, starting with Sunday.
        var weekdays = new Array(
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
        );
        //Use the getDay() method to get the day.
        var day = date.getDay();
        //Return the element that corresponds to that index.
        return weekdays[day];
    }

    let tmp = new Date(timestamp);
    return tmp.getDate() + " " + getWeekDay(tmp) + " " + tmp.getHours()+"h"; 
}

const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000']


function hoverTime(timestamp1,timestamp2){
    let tmp = new Date(timestamp1);
    let tmp2 = new Date(timestamp2);
    return  tmp.getDate() +"/"+ getMonth(tmp.getMonth()) +" " + tmp.getHours() +"h:"+tmp.getMinutes()+"m"+"~"+tmp2.getHours() +"h:"+tmp2.getMinutes()+"m"; 
}