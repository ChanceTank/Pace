const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../backend/server");

describe("Circles API", () => {
	it("should create a new circle", async () => {
		const response = await request(app).post("/api/circles").send({
			name: "Test Circle",
			meeting_frequency: "Weekly",
		});
		expect(response.status).to.equal(200);
		expect(response.body).to.have.property("id");
		expect(response.body.name).to.equal("Test Circle");
		expect(response.body.meeting_frequency).to.equal("Weekly");
	});

	it("should get all circles", async () => {
		const response = await request(app).get("/api/circles");
		expect(response.status).to.equal(200);
		expect(response.body).to.be.an("array");
	});

	it("should update a circle", async () => {
		// First create a circle
		const createResponse = await request(app)
			.post("/api/circles")
			.send({ name: "Original Circle", meeting_frequency: "Weekly" });
		const circleId = createResponse.body.id;

		const response = await request(app)
			.put(`/api/circles/${circleId}`)
			.send({ name: "Updated Circle", meeting_frequency: "Monthly" });
		expect(response.status).to.equal(200);
		expect(response.body.name).to.equal("Updated Circle");
		expect(response.body.meeting_frequency).to.equal("Monthly");
	});

	it("should delete a circle", async () => {
		// First create a circle
		const createResponse = await request(app)
			.post("/api/circles")
			.send({ name: "Circle to Delete", meeting_frequency: "Weekly" });
		const circleId = createResponse.body.id;

		const response = await request(app).delete(`/api/circles/${circleId}`);
		expect(response.status).to.equal(200);
		expect(response.body.deleted).to.be.true;
	});
});
