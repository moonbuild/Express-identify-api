import { prisma } from '../db';
import { ContactData, IdentifyRequest, IdentifyResponse } from '../types/identify';

export class IdentifyService {
  async identify(req: IdentifyRequest): Promise<IdentifyResponse> {
    // destructure data
    const { email, phoneNumber } = req;

    // find contacts with either same email or phoneNumber
    const contacts = await this.findSimilarContacts({ email, phoneNumber });
    if (contacts.length === 0) {
      return this.createPrimaryContact({ email, phoneNumber });
    }

    // since there are related contacts, we gather all primaryContacts
    const allPrimaryRelatedContacts = await this.findPrimaryRelatedContacts(contacts);

    // identify if we need to create new fresh contact
    const needsNewContact = await this.shouldCreateNewContact(allPrimaryRelatedContacts, {
      email,
      phoneNumber,
    });
    if (needsNewContact) {
      // find the primary contact and link it to this new contact
      const primaryContact = this.findPrimaryContact(allPrimaryRelatedContacts);
      await this.createSecondaryContact({ email, phoneNumber }, primaryContact.id);
      // refetch the data as table was updated and create response
      const newLinkedPrimaryContacts = await this.findPrimaryRelatedContacts([primaryContact]);
      return this.createResponse(newLinkedPrimaryContacts);
    }

    // handle edge cases logic to decide
    const conflictResultSuccess = await this.handleConflict(allPrimaryRelatedContacts, {
      email,
      phoneNumber,
    });
    if (conflictResultSuccess) {
      // incase there was an edge case, the handleConflict returns a proper response which we return
      return conflictResultSuccess;
    }

    // else we create response with allLinked
    return this.createResponse(allPrimaryRelatedContacts);
  }

  // This function handles edge cases when creating contact
  private async handleConflict(
    contacts: ContactData[],
    { email, phoneNumber }: IdentifyRequest,
  ): Promise<IdentifyResponse | null> {
    // select only primary contacts and return null if primary contacts are less than 2
    const primaryContacts = contacts.filter((c) => c.linkPrecedence === 'primary');
    if (primaryContacts.length <= 1) {
      return null;
    }

    // find primary contact from email and phoneNumber
    const emailPrimary = primaryContacts.find((c) => c.email === email);
    const phoneNumberPrimary = primaryContacts.find((c) => c.phoneNumber === phoneNumber);

    // check edge case where emailPrimary and phoneNumberPrimary exist but are not the same contact
    if (emailPrimary && phoneNumberPrimary && emailPrimary.id !== phoneNumberPrimary.id) {
      // use reduce function to find the oldest contact
      const oldestPrimary = primaryContacts.reduce((oldest, current) =>
        current.createdAt < oldest.createdAt ? current : oldest,
      );

      /**
       * For every primary contact that is not the oldest (since there is conflict)
       * 1. Update the contact to secondary
       * 2. Update all rows that have this primary contact linked to it to now point to -> oldest contact
       */
      const primariesToConvert = primaryContacts.filter((p) => p.id !== oldestPrimary.id);
      primariesToConvert.forEach(async (primary) => {
        await prisma.contacts.update({
          where: { id: primary.id },
          data: {
            linkedId: oldestPrimary.id,
            linkPrecedence: 'secondary',
            updatedAt: new Date(),
          },
        });

        await prisma.contacts.updateMany({
          where: { linkedId: primary.id },
          data: {
            linkedId: oldestPrimary.id,
            updatedAt: new Date(),
          },
        });
      });

      // since we updated the table, we refresh the contacts and create a new response
      const updatedContacts = await this.findPrimaryRelatedContacts([oldestPrimary]);
      return this.createResponse(updatedContacts);
    }
    return null;
  }

  // Find all contacts that have either phoneNumber or email in common
  async findSimilarContacts({ email, phoneNumber }: IdentifyRequest): Promise<ContactData[]> {
    const contacts = await prisma.contacts.findMany({
      where: {
        OR: [{ phoneNumber }, { email }],
      },
      orderBy: { createdAt: 'asc' },
    });
    return contacts;
  }

  // Find all contacts that are Primary or linked to it
  async findPrimaryRelatedContacts(contacts: ContactData[]): Promise<ContactData[]> {
    const primaryContactIds = new Set<number>();

    // There are two cases 1. linkPrecendence = 'primary' or 2. linkedId has a primaryId
    contacts.forEach((contact) => {
      if (contact.linkPrecedence === 'primary') {
        primaryContactIds.add(contact.id);
      } else if (contact.linkedId) {
        primaryContactIds.add(contact.linkedId);
      }
    });

    // using the stored primaryContactIds we fetch them using the in operator
    const allRelatedContacts = await prisma.contacts.findMany({
      where: {
        OR: [
          { id: { in: Array.from(primaryContactIds) } },
          { linkedId: { in: Array.from(primaryContactIds) } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    return allRelatedContacts;
  }

  // Function to validate the request for further logic
  async shouldCreateNewContact(
    contacts: ContactData[],
    { email, phoneNumber }: IdentifyRequest,
  ): Promise<boolean> {
    // checks if request contact already exists
    const alreadyExists = contacts.find((c) => c.email === email && c.phoneNumber === phoneNumber);
    if (alreadyExists) return false;

    // checks if there is a new email or a new phone number
    const isNewEmail = !!email && !contacts.some((c) => c.email === email);
    const isNewPhonenumber = !!phoneNumber && !contacts.some((c) => c.phoneNumber === phoneNumber);

    //if atleast one of the request is true, we create a contact
    return isNewEmail || isNewPhonenumber;
  }

  // This is simple function to create a primary contact
  async createPrimaryContact({ email, phoneNumber }: IdentifyRequest) {
    const newContact = await prisma.contacts.create({
      data: {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkPrecedence: 'primary',
      },
    });
    return this.createResponse([newContact]);
  }

  // This is simple function to create a secondary contact
  async createSecondaryContact({ email, phoneNumber }: IdentifyRequest, primaryContactId: number) {
    await prisma.contacts.create({
      data: {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkedId: primaryContactId,
        linkPrecedence: 'secondary',
      },
    });
  }

  // This is a simple function to identify the primary contact or the oldest
  private findPrimaryContact(contacts: ContactData[]): ContactData {
    return contacts.find((c) => c.linkPrecedence === 'primary') ?? contacts[0];
  }

  //   sort the array, by prioritizing the value that comes from primary contact
  private sortWithPrimaryFirst<T>(array: T[], primaryValue: T | null): T[] {
    // edge cases for when primary vlaue is null or is not included in array
    if (!primaryValue || !array.includes(primaryValue)) {
      return array;
    }
    // first primaryValue then arrayValues
    return [primaryValue, ...array.filter((item) => item !== primaryValue)];
  }

  //   This function is used to create the correct response to a contacts array
  async createResponse(contacts: ContactData[]): Promise<IdentifyResponse> {
    // seperate contacts array into primary and secondary contacts
    const primary = this.findPrimaryContact(contacts);
    const secondary = contacts.filter((c) => c.linkPrecedence === 'secondary');

    // selects only emails and filters null values from contacts
    const emails = [...new Set(contacts.map((c) => c.email).filter((e) => e != null))];

    // selects only phoneNumbers and filters null values from contacts
    const phoneNumbers = [...new Set(contacts.map((c) => c.phoneNumber).filter((e) => e != null))];

    // We want the emails and phonenumbers to show the primaryValue first
    const sortedEmails = this.sortWithPrimaryFirst(emails, primary.email);
    const sortedPhoneNumbers = this.sortWithPrimaryFirst(phoneNumbers, primary.phoneNumber);

    console.log(emails, phoneNumbers, sortedEmails, sortedPhoneNumbers);

    return {
      contact: {
        primaryContactId: primary.id,
        emails: sortedEmails,
        phoneNumbers: sortedPhoneNumbers,
        secondaryContactIds: secondary.map((s) => s.id),
      },
    };
  }
}
