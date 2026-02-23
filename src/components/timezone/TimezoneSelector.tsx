'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import {
  TIMEZONE_GROUPS,
  getAllTimezoneOptions,
  getTimezoneCityName,
  getTimezoneOffset,
} from '@/lib/timezone';

function getLiveTime(tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

export function TimezoneSelector() {
  const { timezone, setTimezone } = useTimezone();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allOptions = getAllTimezoneOptions();

  const filtered = search
    ? allOptions.filter(
        (opt) =>
          opt.city.toLowerCase().includes(search.toLowerCase()) ||
          opt.value.toLowerCase().includes(search.toLowerCase()) ||
          opt.offset.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const cityName = getTimezoneCityName(timezone);
  const offset = getTimezoneOffset(timezone);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="
            glass-pill border-border bg-surface hover:bg-surface-hover
            text-text-primary gap-2 h-auto py-1.5 px-3
          "
        >
          <Globe className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-sm font-medium">{cityName}</span>
          <span className="text-xs text-text-secondary">{offset}</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[320px] p-0 bg-[#0F1729] border-border shadow-glass"
        align="end"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search city or timezone..."
            value={search}
            onValueChange={setSearch}
            className="text-text-primary placeholder:text-text-muted border-border"
          />
          <CommandList className="max-h-[320px]">
            <CommandEmpty className="text-text-secondary text-sm py-6 text-center">
              No timezone found.
            </CommandEmpty>

            {filtered
              ? /* Search results: flat list */
                filtered.length > 0 && (
                  <CommandGroup heading="Results" className="text-text-secondary">
                    {filtered.map((opt) => (
                      <TimezoneItem
                        key={opt.value}
                        value={opt.value}
                        city={opt.city}
                        offset={opt.offset}
                        isSelected={timezone === opt.value}
                        onSelect={() => {
                          setTimezone(opt.value);
                          setOpen(false);
                          setSearch('');
                        }}
                      />
                    ))}
                  </CommandGroup>
                )
              : /* Grouped list */
                Object.entries(TIMEZONE_GROUPS).map(([region, zones]) => (
                  <CommandGroup
                    key={region}
                    heading={region}
                    className="text-text-secondary"
                  >
                    {zones.map((tz) => (
                      <TimezoneItem
                        key={tz}
                        value={tz}
                        city={getTimezoneCityName(tz)}
                        offset={getTimezoneOffset(tz)}
                        isSelected={timezone === tz}
                        onSelect={() => {
                          setTimezone(tz);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </CommandGroup>
                ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface TimezoneItemProps {
  value: string;
  city: string;
  offset: string;
  isSelected: boolean;
  onSelect: () => void;
}

function TimezoneItem({ value, city, offset, isSelected, onSelect }: TimezoneItemProps) {
  const liveTime = getLiveTime(value);

  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className="flex items-center justify-between px-3 py-2 cursor-pointer text-text-primary hover:bg-surface-hover aria-selected:bg-surface-active"
    >
      <div className="flex items-center gap-2">
        {isSelected ? (
          <Check className="w-3.5 h-3.5 text-primary" />
        ) : (
          <span className="w-3.5" />
        )}
        <span className="text-sm font-medium">{city}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="tabular-nums">{liveTime}</span>
        <span className="text-text-muted">{offset}</span>
      </div>
    </CommandItem>
  );
}
