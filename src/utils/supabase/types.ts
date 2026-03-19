export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      beers: {
        Row: {
          abv: number;
          brewery: string;
          createdAt: string;
          description: string;
          id: number;
          meta: Json;
          name: string;
          real: boolean;
          type: string;
        };
        Insert: {
          abv: number;
          brewery: string;
          createdAt?: string;
          description: string;
          id?: number;
          meta?: Json;
          name: string;
          real: boolean;
          type: string;
        };
        Update: {
          abv?: number;
          brewery?: string;
          createdAt?: string;
          description?: string;
          id?: number;
          meta?: Json;
          name?: string;
          real?: boolean;
          type?: string;
        };
        Relationships: [];
      };
      game_guesses: {
        Row: {
          beerId: number;
          correctAnswer: boolean;
          createdAt: string;
          gameId: number;
          guess: boolean;
          id: number;
          isCorrect: boolean;
          lifeDelta: number;
          pointsAwarded: number;
          streakAfterGuess: number;
          streakBeforeGuess: number;
        };
        Insert: {
          beerId: number;
          correctAnswer: boolean;
          createdAt?: string;
          gameId: number;
          guess: boolean;
          id?: number;
          isCorrect: boolean;
          lifeDelta: number;
          pointsAwarded?: number;
          streakAfterGuess?: number;
          streakBeforeGuess?: number;
        };
        Update: {
          beerId?: number;
          correctAnswer?: boolean;
          createdAt?: string;
          gameId?: number;
          guess?: boolean;
          id?: number;
          isCorrect?: boolean;
          lifeDelta?: number;
          pointsAwarded?: number;
          streakAfterGuess?: number;
          streakBeforeGuess?: number;
        };
        Relationships: [
          {
            foreignKeyName: "game_guesses_beerId_fkey";
            columns: ["beerId"];
            isOneToOne: false;
            referencedRelation: "beers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_guesses_beerId_fkey";
            columns: ["beerId"];
            isOneToOne: false;
            referencedRelation: "random_beers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_guesses_gameId_fkey";
            columns: ["gameId"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          bestStreak: number;
          beerIds: number[];
          correctGuesses: number;
          createdAt: string;
          endedAt: string | null;
          endReason: string | null;
          id: number;
          livesRemaining: number;
          playerName: string | null;
          score: number;
          startingLives: number;
          totalGuesses: number;
          userId: string | null;
        };
        Insert: {
          bestStreak?: number;
          beerIds?: number[];
          correctGuesses?: number;
          createdAt?: string;
          endedAt?: string | null;
          endReason?: string | null;
          id?: number;
          livesRemaining: number;
          playerName?: string | null;
          score: number;
          startingLives?: number;
          totalGuesses?: number;
          userId?: string | null;
        };
        Update: {
          bestStreak?: number;
          beerIds?: number[];
          correctGuesses?: number;
          createdAt?: string;
          endedAt?: string | null;
          endReason?: string | null;
          id?: number;
          livesRemaining?: number;
          playerName?: string | null;
          score?: number;
          startingLives?: number;
          totalGuesses?: number;
          userId?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          createdAt: string;
          displayName: string | null;
          id: string;
          imageUrl: string | null;
          updatedAt: string;
        };
        Insert: {
          createdAt?: string;
          displayName?: string | null;
          id: string;
          imageUrl?: string | null;
          updatedAt?: string;
        };
        Update: {
          createdAt?: string;
          displayName?: string | null;
          id?: string;
          imageUrl?: string | null;
          updatedAt?: string;
        };
        Relationships: [];
      };
      promo_clicks: {
        Row: {
          actorId: string | null;
          createdAt: string;
          gameId: number | null;
          href: string;
          id: number;
          kind: string;
          placement: string;
          promoId: string;
        };
        Insert: {
          actorId?: string | null;
          createdAt?: string;
          gameId?: number | null;
          href: string;
          id?: number;
          kind: string;
          placement: string;
          promoId: string;
        };
        Update: {
          actorId?: string | null;
          createdAt?: string;
          gameId?: number | null;
          href?: string;
          id?: number;
          kind?: string;
          placement?: string;
          promoId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promo_clicks_gameId_fkey";
            columns: ["gameId"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      random_beers: {
        Row: {
          abv: number | null;
          brewery: string | null;
          createdAt: string | null;
          description: string | null;
          id: number | null;
          meta: Json | null;
          name: string | null;
          real: boolean | null;
          type: string | null;
        };
        Insert: {
          abv?: number | null;
          brewery?: string | null;
          createdAt?: string | null;
          description?: string | null;
          id?: number | null;
          meta?: Json | null;
          name?: string | null;
          real?: boolean | null;
          type?: string | null;
        };
        Update: {
          abv?: number | null;
          brewery?: string | null;
          createdAt?: string | null;
          description?: string | null;
          id?: number | null;
          meta?: Json | null;
          name?: string | null;
          real?: boolean | null;
          type?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
