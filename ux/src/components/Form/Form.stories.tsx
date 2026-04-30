import type { Meta, StoryObj } from '@storybook/react';
import { Form } from './Form';
import { TextInput } from '../TextInput/TextInput';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { Button } from '../Button/Button';
import { FormActions } from '../FormActions/FormActions';
import { Stepper } from '../Stepper/Stepper';
import { useForm } from '@mantine/form';
import { Title, Text, Box } from '@mantine/core';
import { useState } from 'react';

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

const StepperFormExample = () => {
  const [active, setActive] = useState(0);
  const form = useForm({
    initialValues: { email: '', password: '', fullName: '' },
    validate: {
      fullName: (v) => (active === 0 && v.length < 2 ? 'Required' : null),
      email: (v) => (active === 1 && !/^\S+@\S+$/.test(v) ? 'Invalid email' : null),
    },
  });

  const nextStep = () => {
    if (active === 0 && form.validateField('fullName').hasError) return;
    if (active === 1 && form.validateField('email').hasError) return;
    setActive((current) => (current < 2 ? current + 1 : current));
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Box mx="auto" w="100%" style={{ maxWidth: 604 }}>
      <Box mb="xl">
        <Stepper active={active}>
          <Stepper.Step label="Personal" />
          <Stepper.Step label="Account" />
          <Stepper.Step label="Confirm" />
        </Stepper>
      </Box>

      <Form onSubmit={form.onSubmit(() => alert('Finished!'))}>
        {active === 0 && (
          <TextInput label="Full Name" placeholder="John Doe" {...form.getInputProps('fullName')} />
        )}
        
        {active === 1 && (
          <TextInput label="Email Address" placeholder="john@example.com" {...form.getInputProps('email')} />
        )}

        {active === 2 && (
          <Box py="md">
            <Text fw={500}>Confirm your details</Text>
            <Text size="sm">Name: {form.values.fullName}</Text>
            <Text size="sm">Email: {form.values.email}</Text>
          </Box>
        )}

        <FormActions fullWidth>
          {active !== 0 && (
            <Button variant="default" onClick={prevStep}>Previous</Button>
          )}
          
          {active < 2 ? (
            <Button onClick={nextStep}>Next Step</Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </FormActions>
      </Form>
    </Box>
  );
};

export const WithStepperAnd50_50: Story = {
  render: () => <StepperFormExample />,
};

const TwoButtonExample = () => {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
    },
  });

  return (
    <Form onSubmit={form.onSubmit(() => alert('Saved!'))}>
      <Title order={3}>Account Settings</Title>
      <Text size="sm" c="dimmed">Buttons spread 50/50 each.</Text>
      
      <TextInput label="Email Address" placeholder="john@example.com" {...form.getInputProps('email')} />
      <PasswordInput label="New Password" placeholder="••••••••" {...form.getInputProps('password')} />
      
      <FormActions fullWidth>
        <Button variant="subtle" color="gray">Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </FormActions>
    </Form>
  );
};

export const With50_50Buttons: Story = {
  render: () => <TwoButtonExample />,
};

const FormExample = () => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      fullName: '',
      bio: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      fullName: (value) => (value.length < 2 ? 'Name is too short' : null),
      password: (value) => (value.length < 6 ? 'Password is too short' : null),
    },
  });

  return (
    <Form onSubmit={form.onSubmit(() => alert('Submitted!'))}>
      <Title order={2}>Create Account</Title>
      <Text size="sm" c="dimmed">This form has a max-width of 604px and minimal rounding.</Text>
      
      <TextInput
        label="Full Name"
        placeholder="John Doe"
        {...form.getInputProps('fullName')}
      />
      
      <TextInput
        label="Email Address"
        placeholder="john@example.com"
        {...form.getInputProps('email')}
      />

      <PasswordInput
        label="Password"
        placeholder="Min 6 characters"
        {...form.getInputProps('password')}
      />

      <Button type="submit">Register</Button>
    </Form>
  );
};

export const Default: Story = {
  render: () => <FormExample />,
};

const LongFormExample = () => {
  const form = useForm({
    initialValues: { field1: '', field2: '', field3: '', field4: '', field5: '' },
    validate: {
      field1: (v) => (v ? null : 'Required'),
      field5: (v) => (v ? null : 'Required'),
    },
  });

  return (
    <div style={{ padding: '20px' }}>
      <Title order={3} mb="xl">Test: Scroll to Error</Title>
      <Form onSubmit={form.onSubmit(() => {})}>
        <TextInput label="Field 1 (Required)" placeholder="Focus will land here" {...form.getInputProps('field1')} />
        <div style={{ height: '300px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Scroll down to see more fields...
        </div>
        <TextInput label="Field 2" {...form.getInputProps('field2')} />
        <TextInput label="Field 3" {...form.getInputProps('field3')} />
        <TextInput label="Field 4" {...form.getInputProps('field4')} />
        <TextInput label="Field 5 (Required)" {...form.getInputProps('field5')} />
        
        <Button type="submit">Submit and Scroll to First Error</Button>
      </Form>
    </div>
  );
};

export const ScrollToError: Story = {
  render: () => <LongFormExample />,
};
