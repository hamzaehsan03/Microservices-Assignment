document.addEventListener('DOMContentLoaded', function() {

    // Retrieve elements that'll be interacted with html references
    const jokeTextElement = document.getElementById('jokeText');
    const jokeTypeSelect = document.getElementById('jokeType');
    const submitJokeButton = document.getElementById('submitJoke');
    const deleteJokeButton = document.getElementById('deleteJoke');
    const nextJokeButton = document.getElementById('nextJoke');
    const noJokeMessageDiv = document.getElementById('noJokeMessage');

    // Store the current joke to be moderated and the ID of the polling interval
    let currentJoke = null;
    let pollingInterval = null;

    // Start an interval to poll the fetchJoke function every 5 seconds
    // Prevent starting another interval if one is already running
    const startPolling = () => {
        if (pollingInterval) return;
        pollingInterval = setInterval(fetchJoke, 5000);
    };

    // Stop polling if it's already running
    const stopPolling = () => {
        if (pollingInterval) 
        {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    };

    // Function to fetch the joke types
    async function fetchJokeTypes() {
        try 
        {
            const response = await fetch('/mod/types');
            if (!response.ok) throw new Error('Failed to fetch types');
            const types = await response.json();

            // Clear existing options
            jokeTypeSelect.innerHTML = ''; 

            // Create a new option element for each type and append it to the dropdown
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.type_name;
                option.textContent = type.type_name;
                jokeTypeSelect.appendChild(option);
            });
        } 
        catch (error) 
        {
            console.error('Error fetching joke types:', error);
        }
    }

    // Function to fetch jokes from the /mod endpoint
    async function fetchJoke() {
        try 
        {
            const response = await fetch('/mod/mod');
            if (!response.ok) 
            {
                // Show a message if no jokes are available
                // Stop polling
                noJokeMessageDiv.style.display = 'block';
                stopPolling();
                throw new Error('No jokes available for moderation.');
            }

            // Hide the no jokes message
            noJokeMessageDiv.style.display = 'none';

            // Store the fetched joke
            currentJoke = await response.json();

            // Update the page with the fetched joke
            jokeTextElement.value = currentJoke.jokeText;
            jokeTypeSelect.value = currentJoke.type;
            startPolling(); 
        } 
        catch (error) 
        {
            console.error('Error fetching joke:', error);
        }
    }

    // Function to handle jokes based on user action
    async function handleJoke(action) {

        // Do nothing if there's no joke
        if (!currentJoke) return;
        try 
        {
            // Construct a request body with updated properties
            const body = {
                joke: {
                    // Copy properties from currentJoke into the new object
                    // Override joke type and text with the value currently in the element field
                    ...currentJoke,
                    jokeText: jokeTextElement.value,
                    type: jokeTypeSelect.value
                },
                action: action
            };
            const response = await fetch('/mod/mod', {
                // Specify this is a POST request#
                // Convert the JS object to a JSON string
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error(`Failed to ${action} joke`);
            // Try fetching the next joke
            fetchJoke(); 
        } 
        catch (error) 
        {
            console.error(`Error ${action} joke:`, error);
        }
    }

    // Fetch types to populate dropdown on page load
    fetchJokeTypes();

    // Initialize the polling when the document is loaded
    startPolling();

    // Set up event listeners for the buttons
    submitJokeButton.addEventListener('click', () => handleJoke('submit'));
    deleteJokeButton.addEventListener('click', () => handleJoke('discard'));
    nextJokeButton.addEventListener('click', fetchJoke);
});

