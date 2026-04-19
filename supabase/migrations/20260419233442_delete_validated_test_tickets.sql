/*
  # Delete validated test tickets

  1. Changes
    - Remove transfer record for ticket 461 (related transfer)
    - Remove 6 validated test tickets (IDs: 461, 478, 503, 504, 505, 507)
  
  2. Notes
    - These tickets were used for testing and are no longer needed
    - Transfer record (ID: 34) must be deleted first due to foreign key constraint
*/

DELETE FROM ticket_transfers WHERE ticket_id IN (461, 478, 503, 504, 505, 507);

DELETE FROM tickets WHERE id IN (461, 478, 503, 504, 505, 507) AND status = 'validated';
