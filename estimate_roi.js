const entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
  title: 'Calculate Cost based on Estimation with Multiple Units',
  guard: (ctx) => {
    const issue = ctx.issue;
    return issue.fields.isChanged('Estimation');
  },
  action: (ctx) => {
    const issue = ctx.issue;
    const estimation = issue.fields.Estimation;

    console.log(issue.id + " CHANGED!");

    if (estimation) {
      const ratePerHour = 100; // Set your hourly rate here
      let totalHours = 0;
      const estStr = String(estimation); // Format like "PT1H30M", "PT1D2H", etc.
      
      console.log("[A] Estimation String:", estStr);

      // Parse hours and minutes if both are present
      const hoursMatch = estStr.match(/(\d+)H/);
      const minutesMatch = estStr.match(/(\d+)M/);
      const daysMatch = estStr.match(/(\d+)D/);
      const weeksMatch = estStr.match(/(\d+)W/);

      if (hoursMatch) {
        totalHours += parseFloat(hoursMatch[1]);
      }
      if (minutesMatch) {
        totalHours += parseFloat(minutesMatch[1]) / 60;
      }
      if (daysMatch) {
        totalHours += parseFloat(daysMatch[1]) * 8; // 1 day = 8 hours
      }
      if (weeksMatch) {
        totalHours += parseFloat(weeksMatch[1]) * 40; // 1 week = 40 hours
      }

      console.log("Total hours calculated: " + totalHours);

      // Calculate and set Cost
      const costValue = `$${(totalHours * ratePerHour).toFixed(2)}`;
      console.log("Setting Cost to: " + costValue);
      issue.fields['Cost'] = costValue;
    } else {
      console.log("Estimation field is empty or undefined.");
      issue.fields['Cost'] = "N/A";
    }
  },
  requirements: {
    Estimation: {
      type: entities.Field.periodType,
      name: 'Estimation'
    },
    Cost: {
      type: entities.Field.stringType,
      name: 'Cost'
    }
  }
});
