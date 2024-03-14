document.addEventListener('DOMContentLoaded', function() {
    const jokeTypeSelect = document.getElementById('jokeType');
    const submitJokeButton = document.getElementById('submitJoke');
    const jokeTextElement = document.getElementById('jokeText'); // Assuming this is your textarea ID
    const form = document.getElementById('jokeForm'); // Assuming this is your form ID
    const messageContainer = document.getElementById('messageContainer'); // Assuming you have a div for messages

    const typesAPI = '/sub/types';
    //const typesAPI = 'http://172.187.208.204/sub/types';

    // Function to fetch joke types from the submit types endpoint to populate the dropdown
    async function fetchJokeTypes() {
        try 
        {
            // Try to fetch the types
            const response = await fetch(typesAPI);
            if (!response.ok) throw new Error('Failed to fetch joke types');

            // Create a default option of 'Any'
            const types = await response.json();
            jokeTypeSelect.innerHTML = '<option value="any">Any</option>';
            
            // Create a new option element for each type and append it to the dropdown
            types.forEach(type => {
                let option = document.createElement('option');
                option.value = type.type_name;
                option.textContent = type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1);
                jokeTypeSelect.appendChild(option);
            });

        } 
        catch (error) 
        {
            console.error('Error fetching joke types:', error);
        }
    }

    // Add an event listener for the form submission
    form.addEventListener('submit', async function(event) {

        //Prevent default form submission behaviour
        event.preventDefault(); 
        
        // Retrieve the type and text from the elements
        const jokeType = jokeTypeSelect.value;
        const jokeText = jokeTextElement.value;

        // Ensure 'any' can't be selected as a joke type
        if (jokeType === 'any') 
        {
            showMessage('Please select a valid joke type.', true); 
            return; 
        }

        try 
        {
            // Attempt to submit a joke to the server using a POST request
            const response = await fetch('/sub/sub', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                // Include the type and text in the body
                body: JSON.stringify({type: jokeType, jokeText: jokeText})
            });

            if (!response.ok) throw new Error('Failed to submit joke');

            // Clear the textbox
            jokeTextElement.value = '';

            // Show success message
            showMessage('Joke submitted successfully!');
        } 
        catch (error) 
        {
            console.error('Error:', error);
            showMessage('Failed to submit joke.', true);
        }
    });

    // Fetch joke types on page load
    fetchJokeTypes();

    // Utility function to show messages
    function showMessage(message, isError = false) {
        
        // Set the message text and change color based on error status
        messageContainer.textContent = message; 
        messageContainer.style.color = isError ? 'red' : 'green'; 

    }
});
