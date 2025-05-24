// Simple test script to validate ship creation API
const testShipCreation = async () => {
    const testData = {
        nombre: "Test Ship",
        agenciaId: 1, // Assuming agency with ID 1 exists
        tipo: "materia prima",
        loa: 150.5,
        estado: "Activo"
    };

    try {
        console.log('Testing ship creation with data:', testData);
        
        const response = await fetch('http://localhost:3001/api/buques', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Error response:', error);
            return;
        }
        
        const result = await response.json();
        console.log('Successfully created ship:', result);
        
    } catch (error) {
        console.error('Network error:', error);
    }
};

// Test with missing fields
const testValidation = async () => {
    const invalidData = {
        nombre: "",
        agenciaId: 0,
        tipo: "materia prima",
        loa: 0,
        estado: "Activo"
    };

    try {
        console.log('\nTesting validation with invalid data:', invalidData);
        
        const response = await fetch('http://localhost:3001/api/buques', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidData),
        });

        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response:', result);
        
    } catch (error) {
        console.error('Network error:', error);
    }
};

// First test validation, then successful creation
testValidation().then(() => {
    return testShipCreation();
});
