/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  try {
    let customers
    let searchName = req.query.searchName
    
    if(!searchName){
      customers = await Customer.all();
    }
    else{
       customers = await Customer.search(searchName)
    }

      // TODO: ask if we are passing JSON or class instances
    return res.render("customer_list.html", { customers })
  } catch (err) {
    return next(err);
  }
});


router.get('/best-customers', async function(req, res, next) {
  try {
    const customers = await Customer.bestCustomers();
    // TODO think about how to better organize templates - inherit from list template or include variables
    return res.render('customers_best.html', { customers });
  } catch(err) {
    return next(err);
  }
})

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  try {
    return res.render("customer_new_form.html");
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  try {
    const { firstName, lastName, phone, notes } = req.body;
    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    const reservations = await customer.getReservations();

    return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    res.render("customer_edit_form.html", { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.phone = req.body.phone;
    customer.notes = req.body.notes;
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  try {
    const customerId = req.params.id;
    console.log('req.body.startAt - before creating Date instance', req.body.startAt);
    const startAt = new Date(req.body.startAt);
    console.log('req.body.startAt - AFTER Date instance', startAt);
    const numGuests = req.body.numGuests;
    const notes = req.body.notes;

    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes,
    });
    await reservation.save();
    console.log('Formated Reservation Time', reservation.getformattedStartAt());

    return res.redirect(`/${customerId}/`);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

