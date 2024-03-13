document.addEventListener('DOMContentLoaded', function() {
    const jokeTextElement = document.getElementById('jokeText');
    const jokeTypeSelect = document.getElementById('jokeType');
    const submitJokeButton = document.getElementById('submitJoke');
    const deleteJokeButton = document.getElementById('deleteJoke');
    const nextJokeButton = document.getElementById('nextJoke');
    const noJokeMessageDiv = document.getElementById('noJokeMessage');

    let currentJoke = null;
    let pollingInterval = null; // Variable to store the interval ID

    const startPolling = () => {
        if (pollingInterval) return; // Avoid starting multiple intervals
        pollingInterval = setInterval(fetchJoke, 5000); // Poll every 5 seconds
    };

    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    };

    async function fetchJokeTypes() {
        try {
            const response = await fetch('/mod/types');
            if (!response.ok) throw new Error('Failed to fetch types');
            const types = await response.json();
            jokeTypeSelect.innerHTML = ''; // Clear existing options
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.type_name;
                option.textContent = type.type_name;
                jokeTypeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching joke types:', error);
        }
    }

    async function fetchJoke() {
        try {
            const response = await fetch('/mod/mod');
            if (!response.ok) {
                noJokeMessageDiv.style.display = 'block';
                stopPolling(); // Stop polling if there are no jokes
                throw new Error('No jokes available for moderation.');
            }
            noJokeMessageDiv.style.display = 'none';
            currentJoke = await response.json();
            jokeTextElement.value = currentJoke.jokeText;
            jokeTypeSelect.value = currentJoke.type;
            startPolling(); // Start polling for the next joke
        } catch (error) {
            console.error('Error fetching joke:', error);
        }
    }

    async function handleJoke(action) {
        if (!currentJoke) return;
        try {
            const body = {
                joke: {
                    ...currentJoke,
                    jokeText: jokeTextElement.value,
                    type: jokeTypeSelect.value
                },
                action: action
            };
            const response = await fetch('/mod/mod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error(`Failed to ${action} joke`);
            fetchJoke(); // Immediately try fetching the next joke
        } catch (error) {
            console.error(`Error ${action} joke:`, error);
        }
    }

    fetchJokeTypes();
    // Initialize the polling when the document is loaded
    startPolling();

    // Set up event listeners
    submitJokeButton.addEventListener('click', () => handleJoke('submit'));
    deleteJokeButton.addEventListener('click', () => handleJoke('discard'));
    nextJokeButton.addEventListener('click', fetchJoke);
});

