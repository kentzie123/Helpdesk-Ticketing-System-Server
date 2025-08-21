const PagePrivilege = require('../models/pagePrivilege');

const getPagePrivilegeByRoleId = async (req, res) => {
  const roleId = req.user.role;
  
  if (!Number.isInteger(roleId)) {
    return res.status(400).json({ error: 'Invalid role ID' });
  }

  try {
    const pagePrivileges = await PagePrivilege.find({ roleId }).lean();

    if (!pagePrivileges.length) {
      return res.status(404).json({ error: 'No page privileges found for this role' });
    }

    res.status(200).json(pagePrivileges);
  } catch (err) {
    console.error(`Error fetching page privileges for roleId ${roleId}:`, err);
    res.status(500).json({ error: 'Server error while fetching page privileges' });
  }
};

module.exports = {
  getPagePrivilegeByRoleId
};
