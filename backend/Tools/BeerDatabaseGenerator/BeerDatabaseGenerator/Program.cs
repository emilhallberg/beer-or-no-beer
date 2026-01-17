using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.Data.Sqlite;

public class Program
{
    static void Main(string[] args)
    {
        string jsonFilePath = "C:\\src\\beer-or-no-beer\\resources\\Beer.json";
        string dbPath = "beers.db";

        // Read and parse the JSON
        List<Beer> beers;
        try
        {
            string jsonString = File.ReadAllText(jsonFilePath);
            beers = JsonSerializer.Deserialize<List<Beer>>(jsonString);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading or parsing JSON: {ex.Message}");
            return;
        }

        // Create SQLite connection
        var connectionString = $"Data Source={dbPath}";
        using var connection = new SqliteConnection(connectionString);
        connection.Open();

        string createTableCmd = @"
            CREATE TABLE IF NOT EXISTS Beers (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                Description TEXT NOT NULL,
                Real INTEGER NOT NULL
            );
        ";
        using var createCmd = new SqliteCommand(createTableCmd, connection);
        createCmd.ExecuteNonQuery();

        // Insert beers
        foreach (var beer in beers)
        {
            var insertCmd = connection.CreateCommand();
            insertCmd.CommandText = @"
                INSERT INTO Beers (Name, Description, Real)
                VALUES ($name, $desc, $real);
            ";
            insertCmd.Parameters.AddWithValue("$name", beer.Name);
            insertCmd.Parameters.AddWithValue("$desc", beer.Description);
            insertCmd.Parameters.AddWithValue("$real", beer.Real ? 1 : 0);
            insertCmd.ExecuteNonQuery();
        }

        Console.WriteLine("Beers successfully saved to SQLite database.");
    }
}
