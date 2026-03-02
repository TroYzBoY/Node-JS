let prismaInstance = null;

const getPrismaClient = () => {
  if (!prismaInstance) {
    try {
      const { PrismaClient } = require('@prisma/client');
      prismaInstance = new PrismaClient({ log: ['error'] });
    } catch {
      prismaInstance = createMockPrisma();
    }
  }
  return prismaInstance;
};

const createMockPrisma = () => {
  const users = new Map();
  const profiles = new Map();
  const applyUserWhere = (list, where = {}) => {
    let result = list;
    if (where.role) result = result.filter((u) => u.role === where.role);
    if (Array.isArray(where.OR) && where.OR.length > 0) {
      result = result.filter((u) => {
        return where.OR.some((cond) => {
          if (cond.username?.contains != null) {
            const needle = String(cond.username.contains).toLowerCase();
            return String(u.username || "").toLowerCase().includes(needle);
          }
          if (cond.email?.contains != null) {
            const needle = String(cond.email.contains).toLowerCase();
            return String(u.email || "").toLowerCase().includes(needle);
          }
          return false;
        });
      });
    }
    return result;
  };

  const self = {
    user: {
      findMany: async ({ where = {}, skip = 0, take = 10 } = {}) => {
        let result = applyUserWhere([...users.values()], where);
        return result.slice(skip, skip + take);
      },
      findUnique: async ({ where }) => {
        if (where.id) return users.get(where.id) || null;
        if (where.email) return [...users.values()].find(u => u.email === where.email) || null;
        return null;
      },
      create: async ({ data }) => {
        const user = { id: Date.now().toString(), createdAt: new Date(), ...data };
        users.set(user.id, user);
        const dup = [...users.values()].filter(u => u.email === data.email);
        if (dup.length > 1) { const e = new Error('Unique constraint'); e.code = 'P2002'; e.meta = { target: ['email'] }; throw e; }
        return user;
      },
      update: async ({ where, data }) => {
        const user = users.get(where.id);
        if (!user) { const e = new Error('Not found'); e.code = 'P2025'; throw e; }
        Object.assign(user, data);
        return user;
      },
      delete: async ({ where }) => {
        const user = users.get(where.id);
        if (!user) { const e = new Error('Not found'); e.code = 'P2025'; throw e; }
        users.delete(where.id);
        return user;
      },
      count: async ({ where = {} } = {}) => {
        const result = applyUserWhere([...users.values()], where);
        return result.length;
      },
    },
    profile: {
      create: async ({ data }) => {
        const profile = { id: Date.now().toString(), ...data };
        profiles.set(data.userId, profile);
        return profile;
      },
    },
    $transaction: async (fn) => fn(self),
  };
  return self;
};

module.exports = { getPrismaClient };
