/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
          `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`,
    );
    return results.rows.map(c => new Customer(c));
  }

  /** find 10 customers with most reservations 
   * return: [<customer>, <customer>,...]
  */
  static async bestCustomers() {
    const customers = await db.query (
      `SELECT c.id,
              c.first_name AS "firstName",
              c.last_name  AS "lastName",
              c.phone,
              c.notes
      FROM customers AS c
      JOIN reservations AS r
      ON c.id = r.customer_id
      GROUP BY c.id
      ORDER BY COUNT(*) DESC
      LIMIT 10`
    );
      return customers.rows.map( c => new Customer(c));
  }

    // SELECT r.start_at, c.id,
    //   c.first_name AS "firstName",
    //   c.last_name  AS "lastName"
    //   FROM customers AS c
    //   JOIN reservations AS r
    //   ON c.id = r.customer_id
    //   WHERE c.id = 39;
  

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
          `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
        [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
            `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
          [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
            `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`, [
            this.firstName,
            this.lastName,
            this.phone,
            this.notes,
            this.id,
          ],
      );
    }
  }

  /** return full name of customer: 'John Smith' */
  fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  /** Search for a customer */
  static async search(name) {
    let customers;
    name = name.split(" ")

    if (name.length === 1) {
       customers = await db.query(
        `SELECT id,
          first_name AS "firstName",
          last_name  AS "lastName",
          phone,
          notes
        FROM customers
        WHERE first_name ILIKE $1 or last_name ILIKE $1
        ORDER BY last_name, first_name`,[`%${name[0]}%`])
    } else {
       customers = await db.query(
        `SELECT id,
        first_name AS "firstName",
        last_name  AS "lastName",
        phone,
        notes
      FROM customers
      WHERE first_name ILIKE $1 or last_name ILIKE $2
      ORDER BY last_name, first_name`,[`%${name[0]}%`, `%${name[1]}%`])
    }
    return customers.rows.map(c => new Customer(c));
  }
}

module.exports = Customer;
