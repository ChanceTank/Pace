const request = require("supertest");
const { app } = require("../backend/server");

describe("Groups API", () => {
	it("should create a new group", async () => {
		const response = await request(app).post("/api/groups").send({
			name: "Test Group",
			description: "A test group",
			meeting_frequency: "Weekly",
		});
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("id");
		expect(response.body.name).toBe("Test Group");
	});

	it("should get all groups", async () => {
		const response = await request(app).get("/api/groups");
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});

	it("should update a group", async () => {
		// First create a group
		const createResponse = await request(app)
			.post("/api/groups")
			.send({ name: "Original Group", meeting_frequency: "Weekly" });
		const groupId = createResponse.body.id;

		const response = await request(app)
			.put(`/api/groups/${groupId}`)
			.send({ name: "Updated Group", meeting_frequency: "Monthly" });
		expect(response.status).toBe(200);
		expect(response.body.name).toBe("Updated Group");
	});

	it("should delete a group", async () => {
		// First create a group
		const createResponse = await request(app)
			.post("/api/groups")
			.send({ name: "Group to Delete", meeting_frequency: "Weekly" });
		const groupId = createResponse.body.id;

		const response = await request(app).delete(`/api/groups/${groupId}`);
		expect(response.status).toBe(200);
		expect(response.body.deleted).toBe(true);
	});
});
