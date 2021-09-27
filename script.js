import http from 'k6/http';
import {
    check,
    sleep
} from 'k6';

const baseUrl = 'http://localhost:1234/v1';
const endpoint = {
    users: `${baseUrl}/users`,
    remove: `${baseUrl}/users/removeAll`
}
let params = {
    headers: {
        "Content-Type": "application/json"
    }
}

export let options = {
    vus: 1,
    duration: '1s',
    thresholds: {
        // the rate of successful checks should be higher than 90%
        //checks: ['rate>0.9'],
        'checks{myTag:createUsers}': ['rate>0.9'],
        'checks{myTag:allUsers}': ['rate>0.9'],
    },
};

export default function () {
    //CREATE_USER
    const pay_create_user = JSON.stringify({
        "id": "",
        "firstName": `first_${__VU}_${__ITER}`,
        "lastName": `last_${__VU}_${__ITER}`,
        "age": 20,
        "occupation": "Quality Engineering",
        "nationality": "Indonesian",
        "hobbies": [
            "Coding"
        ],
        "gender": "MALE",
        "createdDate": "2021-09-17T17:38:41",
        "updatedDate": "2021-09-11T07:19:12.474Z"
    })
    
    let create_response = http.post(endpoint['users'], pay_create_user, params);
    check(create_response, {
        'create user : status is 200': (r) => r.status == 200,
        'is id present': (r) => r.json().hasOwnProperty('id'),
    }, {
        myTag: 'createUsers'
    }, );

    //GET_USER_BY_ID
    let user_id = create_response.json()['id'];
    const res = http.get(`${endpoint['users']}/${user_id}`);
    check(res, {
        'get user : status is 200': (r) => r.status == 200,
    }, {
        myTag: 'allUsers'
    }, );

    sleep(0.1);
}

export function teardown() {
    http.del(endpoint['remove'], null, params);
}