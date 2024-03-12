document.addEventListener('DOMContentLoaded', function() {
    const jokeTextElement = document.getElementById('jokeText');
    const jokeTypeSelect = document.getElementById('jokeType');
    const submitJokeButton = document.getElementById('submitJoke');
    const deleteJokeButton = document.getElementById('deleteJoke');
    const nextJokeButton = document.getElementById('nextJoke');
    const addTypeButton = document.getElementById('addType');
    const noJokeMessageDiv = document.getElementById('noJokeMessage');

    let currentJoke = null;

    // Fetch joke types and populate the select dropdown
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

    // Fetch a joke for moderation
    async function fetchJoke() {
        try {
            const response = await fetch('/mod/mod');
            if (!response.ok) {
                noJokeMessageDiv.style.display = 'block';
                throw new Error('No jokes available for moderation.');
            }
            noJokeMessageDiv.style.display = 'none';
            currentJoke = await response.json();
            jokeTextElement.value = currentJoke.joke_text;
            jokeTypeSelect.value = currentJoke.type_name;
        } catch (error) {
            console.error('Error fetching joke:', error);
        }
    }

    // Handle joke submission or deletion
    async function handleJoke(action) {
        if (!currentJoke) return;
        try {
            const body = {
                joke: {
                    ...currentJoke,
                    joke_text: jokeTextElement.value,
                    type_name: jokeTypeSelect.value
                },
                action: action
            };
            const response = await fetch('/mod/mod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error(`Failed to ${action} joke`);
            fetchJoke(); // Fetch the next joke for moderation
        } catch (error) {
            console.error(`Error ${action} joke:`, error);
        }
    }

    // Event listeners
    submitJokeButton.addEventListener('click', () => handleJoke('submit'));
    deleteJokeButton.addEventListener('click', () => handleJoke('discard'));
    nextJokeButton.addEventListener('click', fetchJoke);
    addTypeButton.addEventListener('click', () => {
        // Implement logic to add a new type
        // This might involve displaying a prompt for the moderator to enter a new type,
        // then updating the types list by calling fetchJokeTypes again.
    });

    fetchJokeTypes(); // Initial fetch of types
    fetchJoke(); // Initial fetch of a joke for moderation
});
