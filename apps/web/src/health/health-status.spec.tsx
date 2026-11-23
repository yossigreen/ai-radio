import { render, screen } from '@testing-library/react';
import { HealthStatus } from './health-status';

describe('HealthStatus', () => {
  it.each([
    ['up', 'API and database are up'],
    ['database-down', 'API is up, database is down'],
    ['unreachable', 'API is unreachable'],
  ] as const)('renders %s', (health, label) => {
    render(<HealthStatus health={health} />);
    expect(screen.getByRole('status')).toHaveTextContent(label);
  });
});
