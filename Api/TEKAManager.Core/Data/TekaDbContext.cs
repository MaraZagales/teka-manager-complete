using Microsoft.EntityFrameworkCore;

namespace TEKAManager.Core.Data;

public class TekaDbContext : DbContext
{
    public TekaDbContext(DbContextOptions<TekaDbContext> options) : base(options)
    {
    }
}
