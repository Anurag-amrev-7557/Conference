import prisma from './prisma';

export type ConferenceRegistrationRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedIn: string;
  designation: string;
  ticketPriceCents: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type ConferenceRegistrationDelegate = {
  findMany: (args: { orderBy: { createdAt: 'desc' } }) => Promise<ConferenceRegistrationRow[]>;
  create: (args: {
    data: Pick<
      ConferenceRegistrationRow,
      | 'name'
      | 'email'
      | 'phone'
      | 'linkedIn'
      | 'designation'
      | 'ticketPriceCents'
      | 'status'
    >;
  }) => Promise<ConferenceRegistrationRow>;
  findUnique: (args: { where: { id: string } }) => Promise<ConferenceRegistrationRow | null>;
  update: (args: {
    where: { id: string };
    data: Partial<
      Pick<
        ConferenceRegistrationRow,
        'name' | 'email' | 'phone' | 'linkedIn' | 'designation' | 'status' | 'ticketPriceCents'
      >
    >;
  }) => Promise<ConferenceRegistrationRow>;
  delete: (args: { where: { id: string } }) => Promise<ConferenceRegistrationRow>;
};

const delegate = (prisma as unknown as { conferenceRegistration: ConferenceRegistrationDelegate })
  .conferenceRegistration;

export const conferenceRegistrations = {
  findMany: () => delegate.findMany({ orderBy: { createdAt: 'desc' } }),
  create: (
    data: Pick<
      ConferenceRegistrationRow,
      'name' | 'email' | 'phone' | 'linkedIn' | 'designation' | 'ticketPriceCents' | 'status'
    >,
  ) => delegate.create({ data }),
  findUnique: (id: string) => delegate.findUnique({ where: { id } }),
  update: (
    id: string,
    data: Partial<
      Pick<
        ConferenceRegistrationRow,
        'name' | 'email' | 'phone' | 'linkedIn' | 'designation' | 'status' | 'ticketPriceCents'
      >
    >,
  ) => delegate.update({ where: { id }, data }),
  delete: (id: string) => delegate.delete({ where: { id } }),
};
