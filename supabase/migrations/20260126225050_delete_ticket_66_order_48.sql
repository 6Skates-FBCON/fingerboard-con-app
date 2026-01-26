/*
  # Delete Ticket #66 and Order #48

  1. Remove Records
    - Delete ticket transfer records for Ticket #66
    - Delete Ticket #66 from tickets table
    - Delete Order #48 from stripe_orders table

  2. Important Notes
    - Deletes are performed in proper order to respect foreign key constraints
    - This removes the orphaned ticket and its associated order from all records
*/

-- Delete ticket transfers associated with Ticket #66
DELETE FROM ticket_transfers WHERE ticket_id = 66;

-- Delete Ticket #66
DELETE FROM tickets WHERE id = 66;

-- Delete Order #48
DELETE FROM stripe_orders WHERE id = 48;