const request = require("supertest");
const { app } = require("../backend/server");

describe("Action Items API", () => {
	it("should create a new action item", async () => {
		// First create a person
		const personResponse = await request(app)
			.post("/api/people")
			.send({ name: "Test Person" });
		const personId = personResponse.body.id;

		const response = await request(app).post("/api/action_items").send({
			person_id: personId,
			description: "Follow up on project",
			due_date: "2023-12-31",
			status: "Pending",
		});
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("id");
		expect(response.body.description).toBe("Follow up on project");
	});

	it("should get all action items", async () => {
		const response = await request(app).get("/api/action_items");
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});

	it("should update an action item", async () => {
		// First create a person and action item
		const personResponse = await request(app)
			.post("/api/people")
			.send({ name: "Test Person 2" });
		const personId = personResponse.body.id;

		const itemResponse = await request(app).post("/api/action_items").send({
			person_id: personId,
			description: "Test action",
			status: "Pending",
		});
		const itemId = itemResponse.body.id;

		const response = await request(app)
			.put(`/api/action_items/${itemId}`)
			.send({
				person_id: personId,
				description: "Updated action",
				status: "Completed",
			});
		expect(response.status).toBe(200);
		expect(response.body.status).toBe("Completed");
	});

	it("should delete an action item", async () => {
		// First create a person and action item
		const personResponse = await request(app)
			.post("/api/people")
			.send({ name: "Test Person 3" });
		const personId = personResponse.body.id;

		const itemResponse = await request(app).post("/api/action_items").send({
			person_id: personId,
			description: "Test action to delete",
		});
		const itemId = itemResponse.body.id;

		const response = await request(app).delete(`/api/action_items/${itemId}`);
		expect(response.status).toBe(200);
		expect(response.body.deleted).toBe(true);
	});
});
