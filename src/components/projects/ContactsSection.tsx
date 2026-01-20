import { useState } from 'react';
import { Contact } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Mail, Phone, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface ContactsSectionProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onRemoveContact: (contactId: string) => void;
  onUpdateContact: (contactId: string, updates: Partial<Contact>) => void;
}

export function ContactsSection({
  contacts,
  onAddContact,
  onRemoveContact,
  onUpdateContact,
}: ContactsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
  });

  const handleAddContact = () => {
    if (!newContact.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    if (!newContact.role.trim()) {
      toast.error('Le rôle est requis');
      return;
    }
    onAddContact(newContact);
    setNewContact({ name: '', role: '', email: '', phone: '' });
    setIsOpen(false);
    toast.success('Contact ajouté');
  };

  const handleRemoveContact = (id: string) => {
    onRemoveContact(id);
    toast.success('Contact supprimé');
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <User size={18} />
          Contacts
        </h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={14} className="mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un contact</DialogTitle>
              <DialogDescription>
                Ajoutez les informations du contact pour ce projet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle *</Label>
                <Input
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  placeholder="Chef de projet, Commercial, Technicien..."
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="jean.dupont@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddContact}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun contact pour ce projet
        </p>
      ) : (
        <div className="grid gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded flex items-center gap-1">
                    <Briefcase size={10} />
                    {contact.role}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Mail size={12} />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Phone size={12} />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => handleRemoveContact(contact.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
