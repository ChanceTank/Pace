const API_URL = "http://localhost:3000/api";

const apiCall = async (endpoint, options = {}) => {
	try {
		const response = await fetch(`${API_URL}${endpoint}`, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "API request failed");
		}

		return await response.json();
	} catch (error) {
		console.error(`API Error [${endpoint}]:`, error);
		throw error;
	}
};

window.apiCall = apiCall;
