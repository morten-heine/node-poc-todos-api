const axios = require('axios');
require('dotenv').config();

(async () => {
    const env=process.env.ENV;

    const apihost = process.env[`api_host_${env}`];
    const apiport = process.env[`api_listen_port_${env}`];

    console.log(apihost);
    console.log(apiport);

    this.httpClient = axios.create({
        baseURL: `http://${apihost}:${apiport}`
    });

    // Get todos
    var response = await this.httpClient.get(`/todos`);
    const fetchedTodos1 = await response.data;
    console.log("Get todos");

    // create new todo
    const todo = { text: 'Test todo', done: false };
    response = await this.httpClient.post('/todos', todo);
    var newTodo = await response.data;
    console.log("Create new todo");

    // get current todos
    response = await this.httpClient.get(`/todos`);
    const fetchedTodos2 = await response.data;
    console.log("Get current todos");

    // Check we have one more
    const l1 = fetchedTodos1.length;
    const l2 = fetchedTodos2.length;
    if (l1 + 1 != l2) {
        throw new Error('testTodoCreation');
    }
    console.log("Check number of current todos");

    // Check the new one has the right data
    response = await this.httpClient.get(`/todos/${newTodo.id}`);
    const fetchedTodo1 = await response.data;
    if (newTodo.name !== fetchedTodo1.name || fetchedTodo1.done) {
        throw new Error('testTodoCreation');
    }
    console.log("Check new todo data");

    // create new comment
    const com = {comment : 'Test comment'};
    response = await this.httpClient.post(`/todos/${newTodo.id}/comments`, com);
    newComment = await response.data;
    console.log("Create new todo comment");

    // Fetch the comment
    response = await this.httpClient.get(`/todos/${newTodo.id}/comments`);
    const fetchedComment = await response.data;
    if (newComment.comment !== fetchedComment[0].comment) {
        throw new Error('testTodoCreation');
    }
    console.log("Get new todo comment");

    // Set the new one to done and check it really is done
    response = await this.httpClient.post(`/todos/${newTodo.id}/done`);
    response = await this.httpClient.get(`/todos/${newTodo.id}`);
    const fetchedTodo2 = await response.data;
    if (!fetchedTodo2.done) {
        throw new Error('testTodoMarkedDone');
    }
    console.log("Set new todo to done");

    // delete new comment
    response = await this.httpClient.delete(`/todos/${newTodo.id}/comments`);
    const deletedComment = response.data;
    console.log("Delete new comment");

    // delete new todo
    response = await this.httpClient.delete(`/todos/${newTodo.id}`);
    const deletedTodo = response.data;
    console.log("Delete new todo");

    // check number went one down again
    response = await this.httpClient.get(`/todos`);
    const fetchedTodos3 = await response.data;
    const l3 = await fetchedTodos3.length;
    if (l3 != l2 - 1) {
        throw new Error('testTodoDeletion');
    }
    console.log("Check new todo is gone");

    response = await this.httpClient.get(`/todos/${newTodo.id}`);
    const fetchedTodo3 = response.data;
    if (fetchedTodo3) {
        throw new Error('testTodoDeletion');
    }

    console.log('All tests passed');
})();