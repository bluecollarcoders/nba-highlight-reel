import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
    // Load stored item
    let storedItem;
    
    try {
        storedItem = JSON.parse(localStorage.getItem(key));
        if (!Array.isArray(storedItem)) {
            storedItem = initialValue; // Ensure it's always an array
        }
    } catch (error) {
        storedItem = initialValue; // Default if JSON parsing fails
    }

    const [storedValue, setStoredValue] = useState(storedItem);

    // Function to update local storage
    const setValue = (value) => {
        const valueToStore = Array.isArray(value) ? value : [];
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
    };

    return [storedValue, setValue];
};

export default useLocalStorage;
