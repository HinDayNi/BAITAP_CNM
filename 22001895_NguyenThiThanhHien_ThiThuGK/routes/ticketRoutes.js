const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const controller = require("../controllers/ticketController");

// GET all tickets
router.get("/", async(req, res, next) => {
    try {
        const tickets = await controller.getAllTickets();
        res.render("tickets/index", { tickets });
    } catch (err) {
        next(err);
    }
});

// GET add form
router.get("/add", (req, res) => {
    res.render("tickets/add");
});

// POST create ticket
router.post("/add", upload.single("image"), async(req, res, next) => {
    try {
        console.log("req.body keys:", Object.keys(req.body));
        console.log("req.body full:", JSON.stringify(req.body));
        console.log("req.body.ticketId:", req.body.ticketId);
        console.log("req.body.eventName:", req.body.eventName);
        console.log("req.file:", req.file ? { filename: req.file.filename, size: req.file.size } : null);
        console.log("Content-Type:", req.headers['content-type']);

        // Validate required fields
        if (!req.body.ticketId || !req.body.eventName || !req.body.price || !req.body.quantity) {
            console.log("Validation failed - missing fields", { ticketId: !!req.body.ticketId, eventName: !!req.body.eventName, price: !!req.body.price, quantity: !!req.body.quantity });
            return res.status(400).render("tickets/add", {
                error: "All fields are required"
            });
        }

        console.log("✓ Validation passed");
        let imageUrl = null;
        if (req.file) {
            console.log("Uploading file to S3...");
            imageUrl = await controller.uploadToS3(req.file);
        }

        const ticket = {
            ticketId: req.body.ticketId.toString().trim(),
            eventName: req.body.eventName.toString().trim(),
            price: Number(req.body.price),
            quantity: Number(req.body.quantity),
            imageUrl: imageUrl
        };
        console.log("Ticket object to save:", JSON.stringify(ticket));
        await controller.createTicket(ticket);
        console.log("✓ Ticket saved successfully");
        res.redirect("/tickets");
    } catch (err) {
        console.error("Create ticket error:", err);
        next(err);
    }
});

// GET edit form
router.get("/:id/edit", async(req, res, next) => {
    try {
        const ticket = await controller.getTicketById(req.params.id);
        if (!ticket) {
            return res.status(404).render("error", { message: "Ticket not found" });
        }
        res.render("tickets/edit", { ticket });
    } catch (err) {
        next(err);
    }
});

// POST update ticket
router.post("/:id/update", upload.single("image"), async(req, res, next) => {
    try {
        const data = {
            eventName: req.body.eventName,
            price: req.body.price,
            quantity: req.body.quantity
        };

        // Handle image upload if a new file is provided
        if (req.file) {
            // Get old ticket to find old image URL
            const oldTicket = await controller.getTicketById(req.params.id);

            // Delete old image from S3 if it exists
            if (oldTicket && oldTicket.imageUrl) {
                try {
                    await controller.deleteFromS3(oldTicket.imageUrl);
                } catch (err) {
                    console.error("Error deleting old image from S3:", err.message);
                }
            }

            // Upload new image
            const imageUrl = await controller.uploadToS3(req.file);
            data.imageUrl = imageUrl;
        }

        await controller.updateTicket(req.params.id, data);
        res.redirect("/tickets");
    } catch (err) {
        next(err);
    }
});

// POST delete ticket
router.post("/:id/delete", async(req, res, next) => {
    try {
        // Get ticket to find image URL
        const ticket = await controller.getTicketById(req.params.id);

        // Delete image from S3 if it exists
        if (ticket && ticket.imageUrl) {
            try {
                await controller.deleteFromS3(ticket.imageUrl);
            } catch (err) {
                console.error("Error deleting image from S3:", err.message);
            }
        }

        // Delete ticket from DynamoDB
        await controller.deleteTicket(req.params.id);
        res.redirect("/tickets");
    } catch (err) {
        next(err);
    }
});

// GET search tickets
router.get("/search", async(req, res, next) => {
    try {
        const keyword = req.query.keyword || "";
        const tickets = keyword ? await controller.searchTickets(keyword) : [];
        res.render("tickets/index", { tickets });
    } catch (err) {
        next(err);
    }
});

module.exports = router;