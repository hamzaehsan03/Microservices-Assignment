document.addEventListener('DOMContentLoaded', function() {
    const jokeTypeSelect = document.getElementById('jokeType');
    const submitJokeButton = document.getElementById('submitJoke');
    const jokeTextElement = document.getElementById('jokeText'); // Assuming this is your textarea ID
    const form = document.getElementById('jokeForm'); // Assuming this is your form ID
    const messageContainer = document.getElementById('messageContainer'); // Assuming you have a div for messages

    const typesAPI = 'http://172.187.208.204/sub/types';

    async function fetchJokeTypes() {
        try 
        {
            const response = await fetch(typesAPI);
            if (!response.ok) throw new Error('Failed to fetch joke types');

            const types = await response.json();
            jokeTypeSelect.innerHTML = '<option value="any">Any</option>';
            
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

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const jokeType = jokeTypeSelect.value;
        const jokeText = jokeTextElement.value;

        if (jokeType === 'any') 
        {
            showMessage('Please select a valid joke type.', true); 
            return; // Do not proceed with submission
        }

        try 
        {
            const response = await fetch('/sub/sub', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
        messageContainer.textContent = message; // Set the message text
        messageContainer.style.color = isError ? 'red' : 'green'; // Change text color based on error status
        
    }
});
