import { Search } from "lucide-react";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import NewChatPopover from "./newchat-popover";

interface Props {
  onSearch: (value: string) => void;
}

const ChatListHeader = ({ onSearch }: Props) => {
  return (
    <div className="px-3 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Chat</h1>
        <div>
          <NewChatPopover />
        </div>
      </div>
      <div>
        <Input className="bg-background text-sm" />
        <InputGroup className="bg-background text-sm">
          <InputGroupInput
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};

export default ChatListHeader;
