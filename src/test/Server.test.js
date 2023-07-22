const axios = require('axios');
require('dotenv').config();

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
    const env=process.env.ENV;
    const apihost = process.env[`api_host_${env}`];
    const apiport = process.env[`api_listen_port_${env}`];
    const apiprotocol = process.env[`api_protocol_${env}`];
    const baseUrl = `${apiprotocol}://${apihost}`+(apiport?`:${apiport}`:"");

    this.httpClient = axios.create({
        baseURL: baseUrl
    });

    // Get todos
    const response1 = await this.httpClient.get(`/todos`);
    const fetchedTodos1 = await response1.data;
    console.log("Got todos");

    // create new item
    const todo = { text: 'Test todo', done: false };
    const response2 = await this.httpClient.post('/todos', todo);
    const newTodo = await response2.data;
    console.log("Created new todo");

    const response3 = await this.httpClient.get(`/todos`);
    const fetchedTodos2 = await response3.data;
    console.log("Got current todos");

    // Check we have one more
    const l1 = fetchedTodos1.length;
    const l2 = fetchedTodos2.length;
    if (l1 + 1 != l2) {
        throw new Error('testTodoCreation, not one more');
    }
    console.log("Checked number of current todos");

    // Check the new one has the right data
    const response4 = await this.httpClient.get(`/todos/${newTodo.id}`);
    const fetchedTodo1 = await response4.data;
    if (newTodo.name !== fetchedTodo1.name || fetchedTodo1.done) {
        throw new Error('testTodoCreation');
    }
    console.log("Checked new todo data");

    // create new comment
    const com = {comment : 'Test comment'};
    const response5 = await this.httpClient.post(`/todos/${newTodo.id}/comments`, com);
    const newComment = await response5.data;
    console.log("Created new todo comment");

    // Fetch the comment
    const response6 = await this.httpClient.get(`/todos/${newTodo.id}/comments`);
    const fetchedComment = await response6.data;
    if (com.comment !== fetchedComment[0].comment) {
        throw new Error(`testTodoCreation`);
    }
    console.log("Got new todo comment");

    // Set the new one to done and check it really is done
    const response7 = await this.httpClient.post(`/todos/${newTodo.id}/done`);
    const response8 = await this.httpClient.get(`/todos/${newTodo.id}`);
    const fetchedTodo2 = await response8.data;
    if (!fetchedTodo2.done) {
        throw new Error('testTodoMarkedDone');
    }
    console.log("Set new todo to done");

    // delete new comment
    const response9 = await this.httpClient.delete(`/todos/${newTodo.id}/comments`);
    const deletedComment = response9.data;
    console.log("Deleted new comment");

    // delete new item
    const response10 = await this.httpClient.delete(`/todos/${newTodo.id}`);
    const deletedTodo = response10.data;
    console.log("Deleted new todo");

    // check number went one down again
    const response11 = await this.httpClient.get(`/todos`);
    const fetchedTodos3 = await response11.data;
    const l3 = await fetchedTodos3.length;
    if (l3 != l2 - 1) {
        throw new Error('testTodoDeletion');
    }
    console.log("Checked new todo is gone");

    const response12 = await this.httpClient.get(`/todos/${newTodo.id}`);
    const fetchedTodo3 = response12.data;
    if (fetchedTodo3) {
        throw new Error('testTodoDeletion');
    }

    console.log('All tests passed');
})();